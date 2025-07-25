"use client";

import { useState, useRef, useEffect } from "react";
import { destinationData } from "@/constants/destinationData";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  type: "bot" | "user";
  content: string;
  timestamp: Date;
}

interface TravelChatbotProps {
  recommendedPlaces: string[];
  characterName: string;
  title: string;
  description: string;
}

async function askGemini(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  userProfile?: { characterName: string; title: string; description: string }
) {
  const res = await fetch("/api/gemini-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, userProfile }),
  });

  if (!res.ok) {
    try {
      const errorData = await res.json();
      return errorData.error || "답변을 가져오지 못했습니다.";
    } catch {
      // JSON 파싱 실패 시 텍스트로 읽기 시도
      try {
        const errorText = await res.text();
        return errorText || "답변을 가져오지 못했습니다.";
      } catch {
        return `서버 오류 (${res.status}): 답변을 가져오지 못했습니다.`;
      }
    }
  }

  try {
    const data = await res.json();
    let answer = "답변을 가져오지 못했습니다.";
    if (data.answer && typeof data.answer === "string") {
      answer = data.answer;
    } else if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      typeof data.candidates[0].content.parts[0].text === "string"
    ) {
      answer = data.candidates[0].content.parts[0].text;
    }
    return answer;
  } catch {
    return "응답을 처리하는 중 오류가 발생했습니다.";
  }
}

const TravelChatbot = ({
  recommendedPlaces,
  characterName,
  title,
  description,
}: TravelChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState<
    "welcome" | "destination" | "info" | "chat"
  >("welcome");
  const [loading, setLoading] = useState(false);
  const [showQuickInfo, setShowQuickInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // 복사 성공 피드백 (간단한 토스트 메시지)
      const toast = document.createElement("div");
      toast.className =
        "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm";
      toast.textContent = "메시지가 복사되었습니다!";
      document.body.appendChild(toast);
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 2000);
    } catch {
      // 클립보드 API 실패 시 fallback
      const textArea = document.createElement("textarea");
      textArea.value = content;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        const toast = document.createElement("div");
        toast.className =
          "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm";
        toast.textContent = "메시지가 복사되었습니다!";
        document.body.appendChild(toast);
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 2000);
      }
    }
  };

  const copyAllChat = async () => {
    const chatText = messages
      .map((msg) => {
        const sender = msg.type === "user" ? "사용자" : "AI";
        const time = msg.timestamp.toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return `[${time}] ${sender}: ${msg.content}`;
      })
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(chatText);
      const toast = document.createElement("div");
      toast.className =
        "fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm";
      toast.textContent = "전체 대화가 복사되었습니다!";
      document.body.appendChild(toast);
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 2000);
    } catch {
      // fallback
      const textArea = document.createElement("textarea");
      textArea.value = chatText;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        const toast = document.createElement("div");
        toast.className =
          "fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm";
        toast.textContent = "전체 대화가 복사되었습니다!";
        document.body.appendChild(toast);
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 2000);
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // 챗봇 시작 메시지
      const welcomeMessage: Message = {
        id: "1",
        type: "bot",
        content:
          "안녕하세요! 🌍 여행 도우미입니다. 추천 여행지에 대해 궁금한 점이 있으시면 언제든 물어보세요!",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  const handleDestinationSelect = (destination: string) => {
    setSelectedDestination(destination);
    setCurrentStep("info");

    const destinationInfo = destinationData[destination];
    if (destinationInfo) {
      const infoMessage: Message = {
        id: Date.now().toString(),
        type: "bot",
        content: `${destinationInfo.name}에 대한 정보를 알려드릴게요! ${
          destinationInfo.name
        }은(는) ${
          destinationInfo.country ? destinationInfo.country + " " : ""
        }${
          destinationInfo.region ? destinationInfo.region + "에 " : ""
        }위치한 곳으로, ${
          destinationInfo.summary
            ? destinationInfo.summary
            : "아직 상세 정보가 준비되지 않았어요."
        } 추가로 궁금한 점이 있으신가요?`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, infoMessage]);
    }
  };

  const handleInfoRequest = (infoType: string) => {
    if (!selectedDestination) return;

    const destinationInfo = destinationData[selectedDestination];
    if (!destinationInfo) return;

    let content = "";
    switch (infoType) {
      case "bestMonths":
        content = `🌤️ ${selectedDestination}의 최적 여행 시기는 ${destinationInfo.bestMonths.join(
          ", "
        )}입니다.`;
        break;
      case "weather":
        content = `🌤️ ${selectedDestination}의 날씨 정보:\n${destinationInfo.weather}`;
        break;
      case "recommendedPlan":
        content = `🗺️ ${selectedDestination} 추천 여행 계획:\n${destinationInfo.recommendedPlan
          .map((plan, index) => `${index + 1}. ${plan}`)
          .join("\n")}`;
        break;
      case "highlights":
        content = `✨ ${selectedDestination}의 하이라이트:\n${destinationInfo.highlights
          .map((highlight) => `• ${highlight}`)
          .join("\n")}`;
        break;
      case "tips":
        content = `💡 ${selectedDestination} 여행 팁:\n${destinationInfo.tips
          .map((tip) => `• ${tip}`)
          .join("\n")}`;
        break;
      case "budget":
        content = `💰 ${selectedDestination} 예상 여행 비용:\n${destinationInfo.budget}`;
        break;
      case "language":
        content = `🗣️ ${selectedDestination} 언어 정보:\n${destinationInfo.language}`;
        break;
      case "currency":
        content = `💱 ${selectedDestination} 통화 정보:\n${destinationInfo.currency}`;
        break;
      default:
        content = "죄송합니다. 해당 정보를 찾을 수 없습니다.";
    }

    const infoMessage: Message = {
      id: Date.now().toString(),
      type: "bot",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, infoMessage]);
  };

  const handleUserMessage = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // 간단한 인사말이나 감사 표현에 대한 즉시 답변
    const simpleResponses: Record<string, string> = {
      안녕: `안녕하세요! ${characterName}님! 😊`,
      안녕하세요: `안녕하세요! ${characterName}님! 😊`,
      고마워: `천만에요! ${characterName}님의 여행이 즐거우시길 바라요! ✨`,
      감사합니다: `천만에요! ${characterName}님의 여행이 즐거우시길 바라요! ✨`,
      고맙습니다: `천만에요! ${characterName}님의 여행이 즐거우시길 바라요! ✨`,
      땡큐: `천만에요! ${characterName}님의 여행이 즐거우시길 바라요! ✨`,
      thanks: `천만에요! ${characterName}님의 여행이 즐거우시길 바라요! ✨`,
      "thank you": `천만에요! ${characterName}님의 여행이 즐거우시길 바라요! ✨`,
      bye: `안녕히 가세요! ${characterName}님! 좋은 여행 되세요! 👋`,
      잘가: `안녕히 가세요! ${characterName}님! 좋은 여행 되세요! 👋`,
      "잘 있어": `안녕히 가세요! ${characterName}님! 좋은 여행 되세요! 👋`,
    };

    const trimmedMessage = message.trim().toLowerCase();
    const simpleResponse = simpleResponses[trimmedMessage];

    if (simpleResponse) {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: simpleResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      return;
    }

    setLoading(true); // Start loading

    // 로딩 시작 시 스크롤을 하단으로 이동
    setTimeout(() => {
      scrollToBottom();
    }, 100);

    // Gemini API 호출용 messages 배열 생성
    const prevMessages: {
      role: "user" | "assistant" | "system";
      content: string;
    }[] = messages.map((m) => ({
      role: m.type === "user" ? "user" : "assistant",
      content: m.content,
    }));

    // 선택한 여행지 정보 포맷팅
    let destinationInfoText = "";
    if (selectedDestination && destinationData[selectedDestination]) {
      const d = destinationData[selectedDestination];
      destinationInfoText = `\n[선택한 여행지] ${d.name}\n[국가] ${
        d.country
      }\n[지역] ${d.region}\n[요약] ${d.summary}\n[날씨] ${
        d.weather
      }\n[최적 여행 시기] ${d.bestMonths.join(
        ", "
      )}\n[추천 일정] ${d.recommendedPlan.join(
        " | "
      )}\n[하이라이트] ${d.highlights.join(", ")}\n[여행 팁] ${d.tips.join(
        ", "
      )}\n[예산] ${d.budget} (호텔, 비행기값 포함)\n[언어] ${
        d.language
      }\n[통화] ${d.currency}`;
    }

    const geminiMessages = [
      {
        role: "system",
        content:
          "너는 여행 전문 챗봇이야. 예산 정보를 안내할 때는 반드시 호텔 숙박비와 비행기(항공권) 비용도 포함해서 알려줘.",
      },
      ...prevMessages,
      {
        role: "user",
        content: `${
          destinationInfoText ? destinationInfoText + "\n" : ""
        }${message}`,
      },
    ] as { role: "user" | "assistant" | "system"; content: string }[];

    // Gemini API 호출
    const botReply = await askGemini(geminiMessages, {
      characterName,
      title,
      description,
    });
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "bot",
      content: botReply,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMessage]);
    setLoading(false); // End loading

    // AI 응답 완료 후 스크롤을 대답의 시작 부분으로 이동
    setTimeout(() => {
      const messagesContainer = document.querySelector(
        '[role="log"]'
      ) as HTMLElement;
      if (messagesContainer) {
        // 마지막 메시지(봇 메시지)의 시작 부분으로 스크롤
        const lastMessage = messagesContainer.lastElementChild;
        if (lastMessage) {
          lastMessage.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    }, 100);
  };

  return (
    <>
      {/* 챗봇 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 flex items-center justify-center"
        aria-label={isOpen ? "챗봇 닫기" : "챗봇 열기"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* 챗봇 패널 (UI for messages, buttons, input) */}
      {isOpen && (
        <div
          className="fixed bottom-4 right-4 w-72 h-[500px] sm:bottom-6 sm:right-6 sm:w-80 sm:h-[600px] md:w-96 md:h-[700px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col"
          role="dialog"
          aria-label="여행 도우미 챗봇"
          aria-modal="true"
        >
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">🌍 여행 도우미</h2>
              <div className="flex items-center space-x-2">
                {messages.length > 1 && (
                  <button
                    onClick={copyAllChat}
                    className="text-white hover:text-gray-200 transition-colors px-2 py-1 rounded text-xs font-medium flex flex-row items-center space-x-1"
                    aria-label="전체 대화 복사"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span>복사</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                  aria-label="챗봇 닫기"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* 메시지 영역 */}
          <div
            className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3"
            role="log"
            aria-live="polite"
            aria-label="채팅 메시지"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex flex-col">
                  <div
                    className={`max-w-[240px] sm:max-w-[280px] md:max-w-xs px-3 py-2 rounded-2xl text-sm ${
                      message.type === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                    role="article"
                    aria-label={`${
                      message.type === "user" ? "사용자" : "봇"
                    } 메시지`}
                  >
                    {message.type === "bot" ? (
                      <div className="markdown-content">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-1 last:mb-0">{children}</p>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-lg font-bold mb-2">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-base font-bold mb-2">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-bold mb-1">
                                {children}
                              </h3>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside mb-2 space-y-1">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside mb-2 space-y-1">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="text-sm inline-block mr-4 mb-2">
                                {children}
                              </li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-bold">{children}</strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic">{children}</em>
                            ),
                            code: ({ children }) => (
                              <code className="bg-gray-200 px-1 py-0.5 rounded text-xs">
                                {children}
                              </code>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-blue-500 pl-2 italic text-gray-600">
                                {children}
                              </blockquote>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-line">
                        {message.content}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => copyMessage(message.content)}
                    className={`text-gray-400 hover:text-gray-600 text-xs p-1 mt-1 ${
                      message.type === "user" ? "self-end" : "self-start"
                    }`}
                    aria-label="메시지 복사"
                    tabIndex={0}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div
                  className="bg-gray-100 text-gray-800 px-3 py-2 rounded-2xl text-sm"
                  role="status"
                  aria-live="polite"
                >
                  <div className="flex items-center space-x-2">
                    <svg
                      className="animate-spin h-4 w-4 text-blue-500"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    <span>잠깐만요, 좋은 정보 찾아보고 있어요 ✨</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div
            className="p-2 sm:p-3 md:p-4 border-t border-gray-200"
            role="form"
            aria-label="메시지 입력"
          >
            {selectedDestination && (
              <div className="flex justify-between items-center mb-2">
                <button
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    setSelectedDestination(null);
                    setCurrentStep("welcome");
                  }}
                  aria-label="다른 여행지 선택하기"
                >
                  여행지 변경
                </button>
                {(currentStep === "info" || currentStep === "chat") && (
                  <button
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                    onClick={() => setShowQuickInfo(!showQuickInfo)}
                    aria-label={
                      showQuickInfo ? "빠른 정보 숨기기" : "빠른 정보 보기"
                    }
                  >
                    {showQuickInfo ? "📋 정보 숨기기" : "📋 빠른 정보"}
                  </button>
                )}
              </div>
            )}
            {currentStep === "welcome" && (
              <div className="space-y-2">
                <p
                  className="text-xs text-gray-600 mb-2"
                  id="destination-label"
                >
                  추천 여행지를 선택해주세요:
                </p>
                <div
                  className="grid grid-cols-2 gap-2"
                  role="group"
                  aria-labelledby="destination-label"
                >
                  {recommendedPlaces.map((place) => (
                    <button
                      key={place}
                      onClick={() => handleDestinationSelect(place)}
                      className="px-2 md:px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                      aria-label={`${place} 선택하기`}
                    >
                      {place}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showQuickInfo &&
              (currentStep === "info" || currentStep === "chat") &&
              selectedDestination && (
                <div className="space-y-2 mb-3">
                  <p className="text-xs text-gray-600 mb-2" id="info-label">
                    빠른 정보:
                  </p>
                  <div
                    className="grid grid-cols-2 gap-1 md:gap-2"
                    role="group"
                    aria-labelledby="info-label"
                  >
                    <button
                      onClick={() => handleInfoRequest("bestMonths")}
                      className="px-1 md:px-2 py-1 bg-green-50 text-green-700 rounded text-xs hover:bg-green-100 transition-colors"
                      aria-label="최적 여행 시기 정보 보기"
                    >
                      🏖️ 최적 시기
                    </button>
                    <button
                      onClick={() => handleInfoRequest("weather")}
                      className="px-1 md:px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors"
                      aria-label="날씨 정보 보기"
                    >
                      🌤️ 날씨 정보
                    </button>
                    <button
                      onClick={() => handleInfoRequest("recommendedPlan")}
                      className="px-1 md:px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs hover:bg-purple-100 transition-colors"
                      aria-label="추천 여행 계획 보기"
                    >
                      🗺️ 여행 계획
                    </button>
                    <button
                      onClick={() => handleInfoRequest("highlights")}
                      className="px-1 md:px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs hover:bg-yellow-100 transition-colors"
                      aria-label="주요 하이라이트 보기"
                    >
                      ✨ 하이라이트
                    </button>
                    <button
                      onClick={() => handleInfoRequest("tips")}
                      className="px-1 md:px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs hover:bg-orange-100 transition-colors"
                      aria-label="여행 팁 보기"
                    >
                      💡 여행 팁
                    </button>
                    <button
                      onClick={() => handleInfoRequest("budget")}
                      className="px-1 md:px-2 py-1 bg-red-50 text-red-700 rounded text-xs hover:bg-red-100 transition-colors"
                      aria-label="예상 비용 정보 보기"
                    >
                      💰 예상 비용
                    </button>
                    <button
                      onClick={() => handleInfoRequest("language")}
                      className="px-1 md:px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs hover:bg-indigo-100 transition-colors"
                      aria-label="언어 정보 보기"
                    >
                      🗣️ 언어 정보
                    </button>
                    <button
                      onClick={() => handleInfoRequest("currency")}
                      className="px-1 md:px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs hover:bg-teal-100 transition-colors"
                      aria-label="통화 정보 보기"
                    >
                      💱 통화 정보
                    </button>
                  </div>
                </div>
              )}

            {currentStep === "info" && (
              <button
                onClick={() => setCurrentStep("chat")}
                className="w-full mt-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 transition-colors"
                aria-label="자유롭게 대화하기"
              >
                💬 자유롭게 대화하기
              </button>
            )}

            {currentStep === "chat" && (
              <>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 px-2 md:px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value.trim()) {
                        handleUserMessage(e.currentTarget.value.trim());
                        e.currentTarget.value = "";
                      }
                    }}
                    disabled={loading}
                    aria-label="메시지 입력"
                    aria-describedby={loading ? "loading-status" : undefined}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget
                        .previousElementSibling as HTMLInputElement;
                      if (input.value.trim()) {
                        handleUserMessage(input.value.trim());
                        input.value = "";
                      }
                    }}
                    className="px-2 md:px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                    aria-label="메시지 전송"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TravelChatbot;
