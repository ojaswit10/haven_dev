import Card from "./Card";
import PillButton from "./PillButton";
import ProgressBar from "./ProgressBar";

const DEPTH_OPTIONS = ["Not at all", "Slightly", "Strongly", "Completely"];

export default function DepthQuestionStep({
  currentQ,
  total,
  question,
  onSelect,
}: {
  currentQ: number;
  total: number;
  question: string;
  onSelect: (val: string) => void;
}) {
  return (
    <Card>
      <div className="space-y-6">
        <ProgressBar current={currentQ} total={total} />
        <h1 className="text-xl md:text-2xl font-serif text-[#2D3748] text-center leading-snug pt-2">
          {question}
        </h1>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {DEPTH_OPTIONS.map((opt) => (
            <PillButton key={opt} onClick={() => onSelect(opt)} outline>
              {opt}
            </PillButton>
          ))}
        </div>
      </div>
    </Card>
  );
}
