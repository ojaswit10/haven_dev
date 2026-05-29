"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Quote, Task } from "@/lib/content";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Assessment {
  id: string;
  attachmentStyle: "anxious" | "avoidant" | "secure" | "disorganized";
  emotionalDepthScore: number;
  category: string;
  createdAt: string;
}

interface Progress {
  id: string;
  currentDay: number;
  dayStreak: number;
  journalStreak: number;
  tasksCompleted: number;
  emotionalTrend: { date: string; mood: string }[];
  graduated: boolean;
}

type Mood = "Better" | "Same" | "Harder" | "Not sure";

// ─── Color tokens ─────────────────────────────────────────────────────────────

const C = {
  bg: "#F0EDE6",
  card: "#FDF8F2",
  accent: "#F8F1E5",
  blue: "#A8C5DA",
  blueDark: "#7BA7C2",
  sand: "#C4A882",
  text: "#2D3748",
  muted: "rgba(45,55,72,0.5)",
  faint: "rgba(45,55,72,0.1)",
  hint: "rgba(45,55,72,0.3)",
  peach: "#E8B4A0",
  border: "rgba(45,55,72,0.07)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function moodToValue(mood: string) {
  if (mood === "Better") return 1;
  if (mood === "Same") return 0;
  if (mood === "Harder") return -1;
  return 0;
}

// ─── Pie chart ────────────────────────────────────────────────────────────────

function PieChart({ trend }: { trend: { date: string; mood: string }[] }) {
  const last7 = trend.slice(-7);
  const better = last7.filter((d) => moodToValue(d.mood) === 1).length;
  const same = last7.filter((d) => moodToValue(d.mood) === 0).length;
  const harder = last7.filter((d) => moodToValue(d.mood) === -1).length;
  const total = last7.length;

  const r = 42;
  const cx = 54;
  const cy = 54;
  const circ = 2 * Math.PI * r;

  const betterDash = total > 0 ? (better / total) * circ : 0;
  const sameDash = total > 0 ? (same / total) * circ : 0;
  const harderDash = total > 0 ? (harder / total) * circ : 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width="108" height="108" viewBox="0 0 108 108" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.faint} strokeWidth="20" />
        {total === 0 ? (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(45,55,72,0.08)" strokeWidth="20" />
        ) : (
          <>
            {better > 0 && (
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.blue} strokeWidth="20"
                strokeDasharray={`${betterDash} ${circ}`}
                strokeDashoffset={0}
                transform={`rotate(-90 ${cx} ${cy})`} />
            )}
            {same > 0 && (
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.sand} strokeWidth="20"
                strokeDasharray={`${sameDash} ${circ}`}
                strokeDashoffset={-betterDash}
                transform={`rotate(-90 ${cx} ${cy})`} />
            )}
            {harder > 0 && (
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.peach} strokeWidth="20"
                strokeDasharray={`${harderDash} ${circ}`}
                strokeDashoffset={-(betterDash + sameDash)}
                transform={`rotate(-90 ${cx} ${cy})`} />
            )}
          </>
        )}
        <circle cx={cx} cy={cy} r="22" fill={C.card} />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fill={C.text} fontFamily="Georgia,serif" fontWeight="500">
          {total > 0 ? total : "\u2014"}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="Georgia,serif">
          {total > 0 ? "days" : "no data"}
        </text>
      </svg>
      <div>
        {total === 0 ? (
          <p style={{ fontSize: 12, color: C.hint, lineHeight: 1.6 }}>
            Check in each day to see your mood trend here.
          </p>
        ) : (
          [
            { color: C.blue, label: "Better", count: better },
            { color: C.sand, label: "Same", count: same },
            { color: C.peach, label: "Harder", count: harder },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: C.muted }}>{item.label}</span>
              <span style={{ fontSize: 13, color: C.text, fontWeight: 500, marginLeft: "auto" }}>{item.count}d</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 20, color: C.hint }}>
        Getting your space ready...
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [completedTasks, setCompletedTasks] = useState<boolean[]>([false, false, false, false]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/dashboard");
      return;
    }
    fetchDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function fetchDashboardData() {
    try {
      const [aRes, pRes, cRes] = await Promise.all([
        fetch("/api/assessment/latest"),
        fetch("/api/progress/get"),
        fetch("/api/content/daily"),
      ]);

      if (aRes.ok) {
        const data = await aRes.json();
        if (data.assessment) {
          setAssessment(data.assessment);
        } else {
          router.push("/");
          return;
        }
      }

      if (pRes.ok) {
        const pData = await pRes.json();
        setProgress(pData.progress);
        const trend = pData.progress?.emotionalTrend ?? [];
        const today = new Date().toISOString().split("T")[0];
        const todayEntry = [...trend].reverse().find(
          (t: { date: string; mood: string }) => t.date === today
        );
        if (todayEntry) setSelectedMood(todayEntry.mood as Mood);
      }

      if (cRes.ok) {
        const cData = await cRes.json();
        if (cData.quote) setQuote(cData.quote);
        if (cData.tasks) {
          setTasks(cData.tasks);
          setCompletedTasks(new Array(cData.tasks.length).fill(false));
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  const handleMoodSelect = async (mood: Mood) => {
    setSelectedMood(mood);
    try {
      await fetch("/api/progress/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });
    } catch {
      // silent
    }
  };

  const toggleTask = (i: number) => {
    setCompletedTasks((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  if (status === "loading" || loading) return <DashboardSkeleton />;
  if (!assessment) return null;

  const day = progress?.currentDay ?? 1;
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const trend = progress?.emotionalTrend ?? [];
  const moods: Mood[] = ["Better", "Same", "Harder", "Not sure"];
  const completedCount = completedTasks.filter(Boolean).length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg }}>
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 60px" }}>

        {/* ── Section 1: Quote bar ─────────────────────────────────────── */}
        <div style={{
          backgroundColor: C.card,
          borderRadius: 18,
          padding: "20px 28px",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.sand, fontWeight: 600, marginBottom: 8 }}>
              Thought for today
            </p>
            <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 16, color: C.text, lineHeight: 1.6 }}>
              {quote ? `\u201C${quote.text}\u201D` : "Loading your thought for today..."}
            </p>
          </div>
          {quote && (
            <p style={{ fontSize: 12, color: C.hint, flexShrink: 0, fontFamily: "Georgia,serif" }}>
              {`\u2014 ${quote.author}`}
            </p>
          )}
        </div>

        {/* ── Sections 2+3: Main two-column area ──────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14, marginBottom: 14 }}>

          {/* ── Section 3: Analysis (left) ──────────────────────────────── */}
          <div style={{ backgroundColor: C.card, borderRadius: 18, padding: 28 }}>

            {/* Greeting + day */}
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: "Georgia,serif", fontSize: 32, color: C.text, fontWeight: 500 }}>
                {`${getGreeting()}, ${firstName}.`}
              </h1>
              <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 14, color: C.muted, marginTop: 5 }}>
                {`Day ${day}. You\u2019re still here. That matters.`}
              </p>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 28 }}>
              {[
                { label: "Day", value: day },
                { label: "Tasks done", value: progress?.tasksCompleted ?? 0 },
                { label: "Journal entries", value: progress?.journalStreak ?? 0 },
              ].map((s) => (
                <div key={s.label} style={{
                  backgroundColor: C.accent,
                  borderRadius: 14,
                  padding: "12px 0",
                  textAlign: "center",
                }}>
                  <p style={{ fontFamily: "Georgia,serif", fontSize: 22, color: C.text, fontWeight: 500 }}>{s.value}</p>
                  <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: C.sand, marginTop: 3 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: 1, backgroundColor: C.border, marginBottom: 24 }} />

            {/* Mood check-in */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.sand, fontWeight: 600, marginBottom: 12 }}>
                How are you feeling right now?
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {moods.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleMoodSelect(opt)}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: 12,
                      border: `1px solid ${selectedMood === opt ? C.blue : C.faint}`,
                      backgroundColor: selectedMood === opt ? C.blue : "transparent",
                      color: selectedMood === opt ? "#FDF8F2" : C.text,
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      fontFamily: "inherit",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {selectedMood && (
                <p style={{ fontSize: 11, color: C.hint, marginTop: 8 }}>Noted. See you tomorrow.</p>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, backgroundColor: C.border, marginBottom: 24 }} />

            {/* Pie chart */}
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.sand, fontWeight: 600, marginBottom: 16 }}>
                Your week
              </p>
              <PieChart trend={trend} />
            </div>

          </div>

          {/* ── Section 2: Tasks (right) ─────────────────────────────────── */}
          <div style={{ backgroundColor: C.card, borderRadius: 18, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.sand, fontWeight: 600 }}>
                {"Today\u2019s tasks"}
              </p>
              <span style={{ fontSize: 11, color: C.hint }}>
                {completedCount}/{tasks.length}
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, backgroundColor: C.faint, borderRadius: 999, marginBottom: 24, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: tasks.length > 0 ? `${(completedCount / tasks.length) * 100}%` : "0%",
                backgroundColor: C.blue,
                borderRadius: 999,
                transition: "width 0.4s ease",
              }} />
            </div>

            {/* Task list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {tasks.map((task, i) => (
                <div
                  key={i}
                  onClick={() => toggleTask(i)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    cursor: "pointer",
                    padding: "14px 16px",
                    borderRadius: 14,
                    backgroundColor: completedTasks[i] ? "rgba(168,197,218,0.1)" : C.accent,
                    border: `1px solid ${completedTasks[i] ? "rgba(168,197,218,0.3)" : "transparent"}`,
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    border: `1.5px solid ${completedTasks[i] ? C.blue : "rgba(45,55,72,0.2)"}`,
                    backgroundColor: completedTasks[i] ? C.blue : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                    transition: "all 0.2s",
                  }}>
                    {completedTasks[i] && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5.5L4 8L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <p style={{
                    fontSize: 13,
                    color: completedTasks[i] ? C.hint : C.text,
                    lineHeight: 1.5,
                    textDecoration: completedTasks[i] ? "line-through" : "none",
                    transition: "all 0.2s",
                    fontFamily: "Georgia,serif",
                  }}>
                    {task.text}
                  </p>
                </div>
              ))}

              {tasks.length === 0 && (
                <p style={{ fontSize: 13, color: C.hint, textAlign: "center", padding: "20px 0" }}>
                  Loading your tasks...
                </p>
              )}
            </div>

            {/* All done state */}
            {tasks.length > 0 && completedCount === tasks.length && (
              <div style={{ marginTop: 20, textAlign: "center" }}>
                <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 13, color: C.blue }}>
                  {"All done for today. That\u2019s no small thing."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Sections 4+5: Entry points ───────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

          {/* Journal */}
          <Link href="/journal" style={{ textDecoration: "none" }}>
            <div
              style={{
                backgroundColor: C.card,
                borderRadius: 18,
                padding: "22px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.accent)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.card)}
            >
              <div>
                <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.sand, fontWeight: 600, marginBottom: 6 }}>
                  Your journal
                </p>
                <p style={{ fontFamily: "Georgia,serif", fontSize: 18, color: C.text, fontWeight: 500 }}>
                  {"Write today\u2019s page"}
                </p>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                  {`You\u2019ve written ${progress?.journalStreak ?? 0} times \u00B7 AI reflects after you write`}
                </p>
              </div>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, opacity: 0.3 }}>
                <path d="M4 10h12M12 5l5 5-5 5" stroke={C.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>

          {/* Chat */}
          <Link href="/chat" style={{ textDecoration: "none" }}>
            <div
              style={{
                backgroundColor: C.accent,
                borderRadius: 18,
                padding: "22px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(168,197,218,0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.accent)}
            >
              <div>
                <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.sand, fontWeight: 600, marginBottom: 6 }}>
                  Your companion
                </p>
                <p style={{ fontFamily: "Georgia,serif", fontSize: 18, color: C.text, fontWeight: 500 }}>
                  Talk to Haven
                </p>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                  No advice. No judgment. Just space to think.
                </p>
              </div>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, opacity: 0.3 }}>
                <path d="M4 10h12M12 5l5 5-5 5" stroke={C.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>

        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", color: C.hint, fontSize: 13 }}>
            {"You showed up today. That\u2019s enough."}
          </p>
        </div>

      </main>
    </div>
  );
}