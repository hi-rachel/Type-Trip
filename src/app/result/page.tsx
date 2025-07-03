"use client";

import { Suspense } from "react";
import ResultPageInner from "./ResultPageInner";

const ResultPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultPageInner />
    </Suspense>
  );
};

export default ResultPage;
