import Card from "./Card";
import AnswerRow from "./AnswerRow";
import ProgressBar from "./ProgressBar";

export default function AssessmentQuestionStep({
  currentQ,
  total,
  question,
  options,
  onSelect,
}: {
  currentQ: number;
  total: number;
  question: string;
  options: string[];
  onSelect: (val: string) => void;
}) {
  return (
    <Card>
      <div className="space-y-6">
        <ProgressBar current={currentQ} total={total} />
        <h1 className="text-xl md:text-2xl font-serif text-[#2D3748] text-center leading-snug pt-2">
          {question}
        </h1>
        <div className="space-y-3 pt-2">
          {options.map((opt) => (
            <AnswerRow key={opt} label={opt} onClick={() => onSelect(opt)} />
          ))}
        </div>
      </div>
    </Card>
  );
}
