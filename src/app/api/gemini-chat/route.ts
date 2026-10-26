import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  userProfile?: {
    characterName: string;
    title: string;
    description: string;
  };
}

interface GeminiPart {
  text?: string;
  thought?: boolean;
}

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: GeminiPart[];
    };
  }[];
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

// 무료 등급 한도가 큰 순서로 시도 (모델마다 한도가 따로 적용됨)
// - gemini-3.5-flash-lite: 분당 15회 / 일일 500회
// - gemini-3.1-flash-lite: 분당 15회 / 일일 500회
// - gemini-flash-latest:   분당 5회 / 일일 20회
const MODELS: readonly string[] = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];
const MAX_ATTEMPTS_PER_MODEL = 2; // 503(일시 과부하)일 때만 재시도
const RETRY_DELAY_MS = 800;

// 분당/일일 요청 제한을 위한 Map
const minuteMap = new Map<string, number>(); // 분당 요청 카운트
const dayMap = new Map<string, number>(); // 일일 요청 카운트
const MINUTE_LIMIT = 15; // 분당 15회
const DAY_LIMIT = 1000; // 일일 1,000회

const sleep = (ms: number): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const parseGeminiJson = async (res: Response): Promise<GeminiResponse> => {
  try {
    return (await res.json()) as GeminiResponse;
  } catch {
    return {};
  }
};

const isQuotaError = (res: Response, data: GeminiResponse): boolean => {
  if (res.status === 429) return true;
  const message = data.error?.message ?? "";
  return /quota|rate limit/i.test(message);
};

export async function POST(req: NextRequest) {
  const now = Date.now();
  const minuteKey = Math.floor(now / 60000).toString(); // 현재 분
  const dayKey = Math.floor(now / 86400000).toString(); // 현재 일

  // 지난 분/일 카운트는 정리해 메모리가 계속 늘지 않도록 함
  minuteMap.forEach((_count, key) => {
    if (key !== minuteKey) minuteMap.delete(key);
  });
  dayMap.forEach((_count, key) => {
    if (key !== dayKey) dayMap.delete(key);
  });

  // 분당 전체 요청 카운트
  const minuteCount = (minuteMap.get(minuteKey) ?? 0) + 1;
  minuteMap.set(minuteKey, minuteCount);
  if (minuteCount > MINUTE_LIMIT) {
    return NextResponse.json(
      {
        error: "요청이 많아 잠시 후 다시 시도해 주세요. (분당 15회 제한)",
      },
      { status: 429 }
    );
  }

  // 일일 전체 요청 카운트
  const dayCount = (dayMap.get(dayKey) ?? 0) + 1;
  dayMap.set(dayKey, dayCount);
  if (dayCount > DAY_LIMIT) {
    return NextResponse.json(
      {
        error:
          "오늘의 무료 사용량이 모두 소진되었습니다. 내일 다시 이용해 주세요.",
      },
      { status: 429 }
    );
  }

  let payload: ChatRequest;
  try {
    payload = (await req.json()) as ChatRequest;
  } catch {
    return NextResponse.json(
      { error: "잘못된 요청 형식입니다." },
      { status: 400 }
    );
  }

  const { messages, userProfile } = payload;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "메시지가 비어 있습니다." },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "No Gemini API key set." },
      { status: 500 }
    );
  }

  // 사용자 프로필 정보를 포함한 시스템 프롬프트
  let systemPrompt = `
너는 여행 전문 챗봇이야. 사용자가 궁금해하는 여행지, 여행 준비, 추천 일정, 현지 문화, 안전 정보, 최신 트렌드 등에 대해 친절하고 구체적으로 답변해줘. 답변은 항상 한국어로 해주고, 최신 여행 트렌드와 안전 정보도 반영하려 노력해. 너무 짧지 않게, 여행자에게 실질적으로 도움이 되는 정보를 제공해줘. 예산 정보를 안내할 때는 반드시 호텔 숙박비와 비행기(항공권) 비용도 포함해서 알려줘.`;

  // 사용자 프로필 정보가 있으면 추가
  if (userProfile) {
    systemPrompt += `

사용자 정보:
- 캐릭터 이름: ${userProfile.characterName}
- 여행 성향: ${userProfile.title}
- 성향 설명: ${userProfile.description}

위 정보를 바탕으로 ${userProfile.characterName}의 여행 성향에 맞는 개인화된 답변을 제공해줘. ${userProfile.characterName}의 취향과 성향을 고려해서 추천하고 조언해줘.`;
  }

  // Gemini는 messages 배열 대신 하나의 prompt로 받음
  const prompt = [
    `시스템: ${systemPrompt}`,
    ...messages.map(
      (m) => `${m.role === "user" ? "사용자" : "AI"}: ${m.content}`
    ),
  ].join("\n");

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  const callGemini = (model: string): Promise<Response> =>
    fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

  let lastStatus = 500;
  let lastData: GeminiResponse = {};
  let allQuotaErrors = true;

  for (const model of MODELS) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_MODEL; attempt++) {
      let res: Response;
      try {
        res = await callGemini(model);
      } catch (networkError) {
        console.error(`[gemini-chat] ${model} 네트워크 오류:`, networkError);
        allQuotaErrors = false;
        break;
      }

      const data = await parseGeminiJson(res);

      if (res.ok) {
        const answer =
          data.candidates?.[0]?.content?.parts
            ?.filter((part) => !part.thought && typeof part.text === "string")
            .map((part) => part.text)
            .join("")
            .trim() || "답변을 가져오지 못했습니다.";
        return NextResponse.json({ answer });
      }

      lastStatus = res.status;
      lastData = data;
      console.error(
        `[gemini-chat] ${model} 실패 (${res.status}):`,
        data.error?.message ?? "응답 본문 없음"
      );

      if (!isQuotaError(res, data)) allQuotaErrors = false;

      // 503(일시 과부하)만 같은 모델로 재시도, 그 외 오류는 다음 모델로 전환
      if (res.status !== 503) break;
      await sleep(RETRY_DELAY_MS);
    }
  }

  // 모든 모델이 한도 초과로 실패한 경우
  if (allQuotaErrors) {
    return NextResponse.json(
      {
        error:
          "Gemini 무료 토큰 한도가 모두 소진되었습니다. 내일 다시 이용해 주세요.",
      },
      { status: 429 }
    );
  }

  return NextResponse.json(
    {
      error: "AI 응답 생성에 실패했습니다.",
      detail: lastData.error?.message,
    },
    { status: lastStatus >= 500 ? lastStatus : 500 }
  );
}
