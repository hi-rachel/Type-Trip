export const getTypeResult = (answers: string[]): string => {
  if (!answers.length) return "healer"; // 기본값

  const countMap: Record<string, number> = {};
  answers.forEach((type) => {
    countMap[type] = (countMap[type] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(countMap));
  const topTypes = Object.entries(countMap)
    .filter(([, count]) => count === maxCount)
    .map(([type]) => type);

  // answers에서 먼저 등장한 타입 반환
  for (const type of answers) {
    if (topTypes.includes(type)) return type;
  }
  return "healer";
};
