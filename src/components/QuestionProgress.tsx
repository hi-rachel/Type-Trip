type Props = {
  current: number;
  total: number;
};

const QuestionProgress = ({ current, total }: Props) => {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full mb-8">
      {/* 진행률 텍스트 */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-600">
          질문 {current} / {total}
        </span>
        <span className="text-sm font-medium text-primary">
          {Math.round(percentage)}%
        </span>
      </div>

      {/* 프로그레스바 */}
      <div className="relative w-full h-3 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-primary via-accent to-highlight transition-all duration-500 ease-out relative overflow-hidden"
          style={{ width: `${percentage}%` }}
        >
          {/* 반짝이는 효과 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />

          {/* 진행 중인 부분의 끝에 작은 원 */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md border-2 border-primary" />
        </div>
      </div>
    </div>
  );
};

export default QuestionProgress;
