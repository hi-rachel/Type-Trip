import type { Question } from "../constants/questions";

type Props = {
  question: Question;
  onSelect: (value: string) => void;
};

const QuestionCard = ({ question, onSelect }: Props) => {
  return (
    <div className="animate-fade-in w-full max-w-md mx-auto bg-white/80 rounded-2xl shadow-lg p-8 text-center">
      <h2 className="text-xl font-bold mb-8 text-gray-800">{question.text}</h2>
      <div className="flex flex-col gap-4">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(option.value)}
            className="bg-white border border-blue-100 rounded-xl px-4 py-3 shadow-sm hover:bg-highlight-50 active:scale-95 transition-all font-medium text-gray-700"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
