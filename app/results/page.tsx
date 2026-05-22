"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ATTACHMENT_CONTENT } from "@/lib/emails/assessmentEmail";
import type { ScoringResult } from "@/lib/scoring";
import WelcomeModal from "@/components/WelcomeModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Assessment {
  id: string;
  attachmentStyle: "anxious" | "avoidant" | "secure" | "disorganized";
  anxiousScore: number;
  avoidantScore: number;
  secureScore: number;
  disorganizedScore: number;
  emotionalDepthScore: number;
  blameIndex: "high" | "low";
  answers: Record<string, string>;
  category: string;
  createdAt: string;
}

// ─── Static content maps ──────────────────────────────────────────────────────

const DOS_DONTS: Record<string, { dos: string[]; donts: string[] }> = {
  anxious: {
    dos: [
      "Let yourself feel the grief without a timeline",
      "Reach out to one person you trust this week",
      "Write down what you needed that you didn&apos;t get",
      "Notice when you&apos;re seeking reassurance — and pause",
    ],
    donts: [
      "Don&apos;t check their profile. It restarts the loop.",
      "Don&apos;t send that message at 2am",
      "Don&apos;t interpret their silence as proof of your worth",
      "Don&apos;t apologise for needing things",
    ],
  },
  avoidant: {
    dos: [
      "Let yourself acknowledge that this hurt — really hurt",
      "Sit with a feeling for five minutes before moving on",
      "Tell one person how you actually are",
      "Notice when you&apos;re using busyness to avoid",
    ],
    donts: [
      "Don&apos;t convince yourself you&apos;re completely fine",
      "Don&apos;t disappear into work or routines as the only coping",
      "Don&apos;t dismiss what you felt as &apos;not a big deal&apos;",
      "Don&apos;t wait until you&apos;re certain before letting someone in",
    ],
  },
  secure: {
    dos: [
      "Trust your own read on the situation",
      "Keep talking — to friends, to a journal, to yourself",
      "Let the grief move through you at its own pace",
      "Notice what you learned about what you need",
    ],
    donts: [
      "Don&apos;t rush the healing to seem okay",
      "Don&apos;t ignore the pain just because you can manage it",
      "Don&apos;t skip the processing to get to the &apos;moving on&apos; part",
      "Don&apos;t minimise it for other people&apos;s comfort",
    ],
  },
  disorganized: {
    dos: [
      "Be gentle with yourself when your feelings contradict each other",
      "Ground yourself before making any big decisions",
      "Write what you feel — even if it doesn&apos;t make sense",
      "Seek support from someone consistent and safe",
    ],
    donts: [
      "Don&apos;t make permanent decisions from temporary emotional states",
      "Don&apos;t reopen contact when you&apos;re in the spiral",
      "Don&apos;t interpret the intensity as meaning it was right",
      "Don&apos;t be alone with the hardest thoughts",
    ],
  },
};

const TRIGGERS: Record<string, string[]> = {
  anxious: [
    "Seeing them active on social media",
    "Hearing songs you shared",
    "Unanswered messages from anyone",
    "Feeling like a burden to friends",
    "Milestones — dates, places, firsts",
  ],
  avoidant: [
    "People asking how you&apos;re really doing",
    "Feeling emotionally needed by others",
    "Spaces that feel too quiet",
    "Being confronted with your own feelings",
    "Anyone getting too close too fast",
  ],
  secure: [
    "Unexpected reminders in ordinary moments",
    "Friends moving on or being unsympathetic",
    "Feeling like you should be &apos;over it&apos;",
    "Quiet evenings when the mind wanders",
    "Watching others in the relationship you wanted",
  ],
  disorganized: [
    "Mixed signals from them, even post-breakup",
    "Physical proximity or familiar environments",
    "Feeling simultaneously pulled toward and away",
    "Emotional intensity of any kind",
    "Memories that feel contradictory",
  ],
};

const STYLE_LABELS: Record<string, string> = {
  anxious: "Anxious Attachment",
  avoidant: "Avoidant Attachment",
  secure: "Secure Attachment",
  disorganized: "Disorganized Attachment",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBar({
  label,
  score,
  total,
  color,
  delay,
}: {
  label: string;
  score: number;
  total: number;
  color: string;
  delay: number;
}) {
  const [width, setWidth] = useState(0);
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-[#2D3748]/80 capitalize">{label}</span>
        <span className="text-sm font-semibold text-[#2D3748]">{pct}%</span>
      </div>
      <div className="h-2.5 bg-[#E8E2D9] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function PatternCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <div className="bg-[#F8F1E5] rounded-2xl p-5 flex gap-4 items-start">
      <span className="text-2xl mt-0.5 shrink-0">{emoji}</span>
      <div>
        <p className="font-semibold text-[#2D3748] text-sm mb-1.5">{title}</p>
        <p className="text-[#2D3748]/60 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function Section({
  label,
  title,
  children,
}: {
  label?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#FDF8F2] rounded-3xl p-7 mb-4">
      {label && (
        <p className="text-[11px] tracking-[2px] uppercase font-bold text-[#C4A882] mb-3">
          {label}
        </p>
      )}
      <h2 className="font-serif text-xl text-[#2D3748] mb-5">{title}</h2>
      {children}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="min-h-screen bg-[#F0EDE6] flex items-center justify-center px-8">
      <p className="font-serif italic text-[#2D3748]/50 text-xl text-center max-w-md leading-relaxed animate-pulse">
        Putting your reflection together...
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [scores, setScores] = useState<ScoringResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);

  const claimAssessment = useCallback(async () => {
    setClaimed(true);
    const assessmentId = localStorage.getItem("haven_assessment_id");

    // No assessmentId in localStorage — try fetching latest from DB
    if (!assessmentId) {
      try {
        const res = await fetch("/api/assessment/latest");
        if (res.ok) {
          const data = await res.json();
          if (data.assessment) {
            setAssessment(data.assessment);
            setScores(data.scores);
            return;
          }
        }
      } catch {}
      setError("no_assessment");
      return;
    }

    // assessmentId found — claim it
    try {
      const res = await fetch("/api/assessment/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "claim_failed");
        return;
      }

      localStorage.removeItem("haven_assessment_id");
      localStorage.setItem("haven_welcomed", "true");
      setAssessment(data.assessment);
      setScores(data.scores);
    } catch {
      setError("network_error");
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/results");
      return;
    }

    if (status === "authenticated" && !claimed) {
      const t = setTimeout(() => claimAssessment(), 0);
      return () => clearTimeout(t);
    }
  }, [status, claimed, claimAssessment, router]);

  // ── Error states ──────────────────────────────────────────────────────────

  if (error === "no_assessment") {
    return (
      <main className="min-h-screen bg-[#F0EDE6] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="font-serif text-2xl text-[#2D3748] mb-3">
            We couldn&apos;t find your assessment.
          </p>
          <p className="text-[#2D3748]/50 text-sm mb-8 leading-relaxed">
            This can happen if you&apos;re on a different device or cleared your browser.
            Take the assessment again — it only takes a few minutes.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 rounded-full bg-[#A8C5DA] text-[#FDF8F2] text-sm font-semibold hover:bg-[#7BA7C2] transition-colors"
          >
            Start again
          </Link>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#F0EDE6] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="font-serif text-2xl text-[#2D3748] mb-3">Something went wrong.</p>
          <p className="text-[#2D3748]/50 text-sm mb-8">Please try refreshing the page.</p>
          <button
            onClick={() => { setClaimed(false); }}
            className="px-8 py-3 rounded-full bg-[#A8C5DA] text-[#FDF8F2] text-sm font-semibold hover:bg-[#7BA7C2] transition-colors"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!assessment || !scores) return <ResultsSkeleton />;

  // ── Resolved ──────────────────────────────────────────────────────────────

  const style = assessment.attachmentStyle;
  const content = ATTACHMENT_CONTENT[style];
  const total =
    assessment.anxiousScore +
    assessment.avoidantScore +
    assessment.secureScore +
    assessment.disorganizedScore || 1;

  const scoreRows = [
    { label: "Anxious", score: assessment.anxiousScore, color: "#C4A882" },
    { label: "Avoidant", score: assessment.avoidantScore, color: "#7BA7C2" },
    { label: "Secure", score: assessment.secureScore, color: "#A8C5DA" },
    { label: "Disorganized", score: assessment.disorganizedScore, color: "#B8A9C9" },
  ];

  const dos = DOS_DONTS[style];
  const triggers = TRIGGERS[style];

  return (
    <main className="min-h-screen bg-[#F0EDE6] px-4 py-12">
      <WelcomeModal />
      <WelcomeModal />
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-[2px] uppercase font-bold text-[#C4A882] mb-3">
            Your Reflection
          </p>
          <h1 className="font-serif text-3xl text-[#2D3748] mb-3">
            Here&apos;s what we noticed.
          </h1>
          <p className="text-[#2D3748]/50 text-sm leading-relaxed max-w-sm mx-auto">
            Not a diagnosis. Not a label. A mirror — offered with care.
          </p>
        </div>

        {/* Attachment Style */}
        <div className="bg-[#FDF8F2] rounded-3xl p-7 mb-4 border-l-4 border-[#A8C5DA]">
          <p className="text-[11px] tracking-[2px] uppercase font-bold text-[#C4A882] mb-3">
            Your Attachment Style
          </p>
          <h2 className="font-serif text-3xl text-[#2D3748] mb-4">
            {STYLE_LABELS[style]}
          </h2>
          <p className="text-[#2D3748]/70 leading-relaxed text-[15px]">
            {content.description}
          </p>
          <p className="text-[11px] text-[#A89F8E] italic mt-4">
            Based on attachment theory research (Bowlby, 1969; Ainsworth, 1978).
          </p>
        </div>

        {/* Score Breakdown */}
        <Section label="Score Breakdown" title="How your answers fell across styles">
          {scoreRows.map((row, i) => (
            <ScoreBar
              key={row.label}
              label={row.label}
              score={row.score}
              total={total}
              color={row.color}
              delay={300 + i * 150}
            />
          ))}
          <p className="text-[11px] text-[#A89F8E] mt-4 leading-relaxed">
            Most people carry more than one style. The dominant one shapes how you show up in relationships — but it&apos;s not fixed.
          </p>
        </Section>

        {/* Behavioral Patterns */}
        <Section label="Patterns We Noticed" title="Does any of this sound familiar?">
          <div className="space-y-3">
            {content.patterns.map((p, i) => (
              <PatternCard
                key={i}
                emoji={p.emoji}
                title={p.title}
                description={p.description}
                index={i}
              />
            ))}
          </div>
        </Section>

        {/* Triggers */}
        <Section label="Your Triggers" title="Things that might be making this harder">
          <div className="space-y-2.5">
            {triggers.map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#A8C5DA] mt-2 shrink-0" />
                <p className="text-[#2D3748]/70 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: t }} />
              </div>
            ))}
          </div>
        </Section>

        {/* Do's and Don'ts */}
        <Section label="Gentle Guidance" title="What tends to help — and what doesn't">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-xs font-semibold text-[#2D3748]/40 uppercase tracking-widest mb-3">
                Worth trying
              </p>
              <div className="space-y-2.5">
                {dos.dos.map((d, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#A8C5DA]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7BA7C2]" />
                    </div>
                    <p className="text-[#2D3748]/70 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: d }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="h-px bg-[#E8E2D9]" />
            <div>
              <p className="text-xs font-semibold text-[#2D3748]/40 uppercase tracking-widest mb-3">
                Worth avoiding
              </p>
              <div className="space-y-2.5">
                {dos.donts.map((d, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#C4A882]/15 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C4A882]" />
                    </div>
                    <p className="text-[#2D3748]/70 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: d }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Emotional Depth */}
        <div className="bg-[#FDF8F2] rounded-3xl p-7 mb-4">
          <p className="text-[11px] tracking-[2px] uppercase font-bold text-[#C4A882] mb-3">
            Emotional Depth
          </p>
          <div className="flex items-end gap-3 mb-3">
            <span className="font-serif text-5xl text-[#2D3748]">
              {assessment.emotionalDepthScore}
            </span>
            <span className="text-[#2D3748]/40 text-sm mb-2">out of 9</span>
          </div>
          <p className="text-[#2D3748]/60 text-sm leading-relaxed">
            {assessment.emotionalDepthScore >= 7
              ? "You're processing this at a very deep level. That depth is both your sensitivity and your strength."
              : assessment.emotionalDepthScore >= 4
              ? "You're engaging with this thoughtfully. There's more underneath when you're ready to look."
              : "You may still be in the early stages of processing. That's okay — not everything needs to be felt at once."}
          </p>
        </div>

        {/* Journey CTA */}
        <div className="bg-[#FDF8F2] rounded-3xl p-7 mb-4 text-center">
          <p className="text-[11px] tracking-[2px] uppercase font-bold text-[#C4A882] mb-3">
            Your Journey
          </p>
          <h2 className="font-serif text-xl text-[#2D3748] mb-4">
            Ready to keep going?
          </h2>
          <p className="text-[#2D3748]/50 text-sm leading-relaxed mb-6 max-w-xs mx-auto">
            A 14-day path built around your attachment style. Daily tasks, a journal with AI reflections, and a companion who shows up when you need it.
          </p>
          <div className="bg-[#F8F1E5] rounded-2xl p-5 mb-6 text-left select-none">
            <p className="text-[#2D3748]/20 text-sm leading-relaxed blur-sm pointer-events-none">
              Day 1 — Don&apos;t check their profile today. Just today. · Day 3 — Text one person you haven&apos;t spoken to in a while. · Day 7 — Write down one thing you genuinely like about yourself. · Day 14 — Do one thing today that is entirely for you.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-block px-10 py-3.5 rounded-full bg-[#A8C5DA] text-[#FDF8F2] text-sm font-semibold hover:bg-[#7BA7C2] transition-colors duration-200"
          >
            Start your journey
          </Link>
          <p className="text-[11px] text-[#A89F8E] mt-3">Free to start. No credit card.</p>
        </div>

        {/* Closing */}
        <div className="text-center py-8">
          <p className="font-serif italic text-[#2D3748]/50 text-lg leading-relaxed">
            You reached out. That already took courage.
          </p>
        </div>

      </div>
    </main>
  );
}