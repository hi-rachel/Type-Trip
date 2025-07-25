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

// 분당/일일 요청 제한을 위한 Map
const minuteMap = new Map<string, number>(); // 분당 요청 카운트
const dayMap = new Map<string, number>(); // 일일 요청 카운트
const MINUTE_LIMIT = 15; // 분당 15회
const DAY_LIMIT = 1500; // 일일 1,500회

export async function POST(req: NextRequest) {
  const now = Date.now();
  const minuteKey = Math.floor(now / 60000); // 현재 분
  const dayKey = Math.floor(now / 86400000); // 현재 일

  // 분당 전체 요청 카운트
  minuteMap.set(
    minuteKey.toString(),
    (minuteMap.get(minuteKey.toString()) || 0) + 1
  );
  if (minuteMap.get(minuteKey.toString())! > MINUTE_LIMIT) {
    return NextResponse.json(
      {
        error: "요청이 많아 잠시 후 다시 시도해 주세요. (분당 15회 제한)",
      },
      { status: 429 }
    );
  }

  // 일일 전체 요청 카운트
  dayMap.set(dayKey.toString(), (dayMap.get(dayKey.toString()) || 0) + 1);
  if (dayMap.get(dayKey.toString())! > DAY_LIMIT) {
    return NextResponse.json(
      {
        error:
          "오늘의 무료 사용량(1,500회)이 모두 소진되었습니다. 내일 다시 이용해 주세요.",
      },
      { status: 429 }
    );
  }

  const { messages, userProfile } = (await req.json()) as ChatRequest;

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "No Gemini API key set." },
      { status: 500 }
    );
  }

  // 사용자 프로필 정보를 포함한 시스템 프롬프트
  let systemPrompt = `
너는 여행 전문 챗봇이야. 사용자가 궁금해하는 여행지, 여행 준비, 추천 일정, 현지 문화, 안전 정보, 최신 트렌드 등에 대해 친절하고 구체적으로 답변해줘. 답변은 항상 한국어로 해주고, 최신 여행 트렌드와 안전 정보도 반영하려 노력해. 너무 짧지 않게, 여행자에게 실질적으로 도움이 되는 정보를 제공해줘.`;

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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  const geminiRes = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!geminiRes.ok) {
    const data = await geminiRes.json();

    // Gemini에서 토큰 한도 초과 에러 감지
    if (
      data.error &&
      data.error.message &&
      (data.error.message.includes("quota") ||
        data.error.message.includes("Quota") ||
        data.error.message.includes("rate limit") ||
        data.error.message.includes("Rate limit"))
    ) {
      return NextResponse.json(
        {
          error:
            "Gemini 무료 토큰 한도가 모두 소진되었습니다. 내일 다시 이용해 주세요.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "AI 응답 생성에 실패했습니다." },
      { status: 500 }
    );
  }

  const data = await geminiRes.json();
  const answer =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "답변을 가져오지 못했습니다.";

  return NextResponse.json({ answer });
}
