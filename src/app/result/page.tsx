"use client";

import { Suspense } from "react";
import ResultPageInner from "./ResultPageInner";

const ResultPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <svg
            className="animate-spin h-8 w-8 text-[##F6C851] mb-4"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
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
          <span className="text-slate-500 font-semibold text-lg">
            여행 결과를 불러오는 중입니다...
          </span>
        </div>
      }
    >
      <ResultPageInner />
    </Suspense>
  );
};

export default ResultPage;
