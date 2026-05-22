export default function PillButton({
  children,
  onClick,
  selected,
  outline,
}: {
  children: React.ReactNode;
  onClick: () => void;
  selected?: boolean;
  outline?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-7 py-3 rounded-full text-sm font-medium transition-all duration-200 border
        ${selected
          ? "bg-[#A8C5DA] border-[#A8C5DA] text-[#2D3748]"
          : outline
          ? "bg-transparent border-[#2D3748]/20 text-[#2D3748] hover:border-[#A8C5DA] hover:bg-[#A8C5DA]/10"
          : "bg-[#A8C5DA] border-[#A8C5DA] text-[#2D3748] hover:bg-[#7BA7C2] hover:border-[#7BA7C2]"
        }
      `}
    >
      {children}
    </button>
  );
}
