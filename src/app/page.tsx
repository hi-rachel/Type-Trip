"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { questions } from "@/constants/questions";
import QuestionProgress from "@/components/QuestionProgress";
import QuestionCard from "@/components/QuestionCard";
import { getTypeResult } from "@/lib/getTypeResult";

const TestPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  // step이 유효한 범위 내에 있는지 확인
  const currentStep = Math.min(Math.max(0, step), questions.length - 1);
  const currentQuestion = questions[currentStep];

  const handleSelect = (value: string) => {
    const next = [...answers];
    next[currentStep] = value;
    setAnswers(next);

    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setStep((prev) => prev + 1);
      } else {
        // 모든 답변 완료 시 결과 계산 후 이동
        const resultId = getTypeResult(next); // 답변 배열로 결과 id 계산
        router.push(`/result?id=${resultId}`);
      }
    }, 200);
  };

  const handleBack = () => {
    setStep((prev) => (prev > 0 ? prev - 1 : 0));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-[#f9f9fc]">
      <div className="w-full max-w-md">
        <QuestionProgress current={currentStep + 1} total={questions.length} />
        <QuestionCard question={currentQuestion} onSelect={handleSelect} />
        {currentStep > 0 && (
          <button
            onClick={handleBack}
            className="mt-8 text-sm text-gray-400 hover:text-primary transition flex items-center gap-1"
          >
            <span className="text-lg">←</span> 이전 질문으로
          </button>
        )}
      </div>
    </div>
  );
};

export default TestPage;
