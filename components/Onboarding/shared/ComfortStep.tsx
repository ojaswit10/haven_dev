import Card from "./Card";
import PillButton from "./PillButton";

export default function ComfortStep({
  message,
  subtext,
  onContinue,
}: {
  message: string;
  subtext: string;
  onContinue: () => void;
}) {
  return (
    <Card>
      <div className="text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-serif italic text-[#2D3748] leading-snug">
          {message}
        </h1>
        <p className="text-[#2D3748]/50 text-base max-w-md mx-auto">
          {subtext}
        </p>
        <div className="pt-2">
          <PillButton onClick={onContinue}>{"Yes, let's go"}</PillButton>
        </div>
      </div>
    </Card>
  );
}
