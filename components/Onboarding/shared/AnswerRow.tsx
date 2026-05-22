export default function AnswerRow({
  label,
  onClick,
  selected,
}: {
  label: string;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-6 py-4 rounded-2xl border text-sm text-[#2D3748] transition-all duration-200
        ${selected
          ? "border-[#A8C5DA] bg-[#A8C5DA]/20"
          : "border-[#2D3748]/10 bg-white/60 hover:border-[#A8C5DA] hover:bg-[#A8C5DA]/10"
        }
      `}
    >
      {label}
    </button>
  );
}
