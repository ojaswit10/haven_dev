export default function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const progress = ((current - 1) / total) * 100;

  return (
    <div className="space-y-2">
      <p className="text-center text-xs text-[#A8C5DA]">
        Question {current} of {total}
      </p>
      <div className="w-full h-1 bg-[#2D3748]/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#A8C5DA] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
