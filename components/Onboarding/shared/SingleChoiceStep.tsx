import Card from "./Card";
import PillButton from "./PillButton";

export default function SingleChoiceStep({
  question,
  options,
  onSelect,
}: {
  question: string;
  options: string[];
  onSelect: (val: string) => void;
}) {
  return (
    <Card>
      <div className="text-center space-y-8">
        <h1 className="text-2xl md:text-3xl font-serif text-[#2D3748] leading-snug">
          {question}
        </h1>
        <div className="flex flex-wrap justify-center gap-3">
          {options.map((opt) => (
            <PillButton key={opt} onClick={() => onSelect(opt)} outline>
              {opt}
            </PillButton>
          ))}
        </div>
      </div>
    </Card>
  );
}
