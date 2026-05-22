import { useState } from "react";
import { Heart, Mail } from "lucide-react";
import Link from "next/link";
import Card from "./Card";

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

export default function DoneStep({
  onSeeResults,
}: {
  onSeeResults: (email?: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email && !isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");
    onSeeResults(email.trim() || undefined);
    setSubmitted(true);
  };

  const handleSkip = () => {
    setEmailError("");
    onSeeResults(undefined);
    setSubmitted(true);
  };

  // ── Confirmation screen ───────────────────────────────────────────────────
  if (submitted) {
    return (
      <Card>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#A8C5DA]/20 flex items-center justify-center mx-auto">
            <Mail size={28} className="text-[#A8C5DA]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-serif italic text-[#2D3748] leading-snug">
            Check your inbox.
          </h1>
          {email ? (
            <p className="text-[#2D3748]/60 text-sm max-w-sm mx-auto leading-relaxed">
              Your free reflection is on its way to{" "}
              <span className="text-[#2D3748]/80 font-medium">{email.trim()}</span>.
              It should arrive in the next few minutes.
            </p>
          ) : (
            <p className="text-[#2D3748]/60 text-sm max-w-sm mx-auto leading-relaxed">
              Sign in to unlock your full analysis whenever you&apos;re ready.
            </p>
          )}
          <div className="bg-[#F8F1E5] rounded-2xl px-5 py-4 text-left space-y-1.5">
            <p className="text-xs font-semibold text-[#2D3748]/40 uppercase tracking-widest mb-2">
              Can&apos;t find it?
            </p>
            <p className="text-sm text-[#2D3748]/50 leading-relaxed">
              Check your spam or promotions folder — it sometimes lands there first.
              The email comes from{" "}
              <span className="text-[#2D3748]/70 font-medium">hello@yourdomain.com</span>.
            </p>
          </div>
          <div className="pt-2">
            <p className="text-xs text-[#2D3748]/30">
              Rather not wait?{" "}
              <Link
                href="/signin?callbackUrl=/results"
                className="text-[#7BA7C2] hover:text-[#A8C5DA] transition-colors underline underline-offset-2"
              >
                Sign in directly
              </Link>
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // ── Email capture screen ──────────────────────────────────────────────────
  return (
    <Card>
      <div className="text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#A8C5DA]/20 flex items-center justify-center mx-auto">
          <Heart size={28} className="text-[#A8C5DA]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-serif italic text-[#2D3748] leading-snug">
          Thank you for trusting us with this.
        </h1>
        <p className="text-[#2D3748]/50 text-sm max-w-md mx-auto leading-relaxed">
          Where should we send your free reflection?
        </p>
        <div className="space-y-1.5 text-left">
          <label className="text-xs text-[#2D3748]/50 pl-1">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="your@email.com"
            className={`w-full px-4 py-3 rounded-2xl border bg-[#F0EDE6] text-[#2D3748] text-sm placeholder:text-[#2D3748]/30 focus:outline-none transition-colors ${
              emailError
                ? "border-red-300 focus:border-red-300"
                : "border-[#2D3748]/10 focus:border-[#A8C5DA]"
            }`}
          />
          {emailError && (
            <p className="text-xs text-red-400 pl-1">{emailError}</p>
          )}
        </div>
        <div className="pt-2 space-y-3">
          <button
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-full bg-[#A8C5DA] text-[#FDF8F2] text-sm font-semibold hover:bg-[#7BA7C2] transition-colors duration-200"
          >
            Send my reflection
          </button>
          <button
            onClick={handleSkip}
            className="block w-full text-xs text-[#2D3748]/30 hover:text-[#2D3748]/50 transition-colors"
          >
            Skip, I&apos;ll sign in directly
          </button>
        </div>
        <p className="text-[#2D3748]/30 text-xs">
          Free. No spam. One email.
        </p>
      </div>
    </Card>
  );
}