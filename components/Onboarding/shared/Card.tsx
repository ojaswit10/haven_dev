export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-[#F5F0E8] rounded-3xl shadow-sm p-10 md:p-14">
      {children}
    </div>
  );
}
