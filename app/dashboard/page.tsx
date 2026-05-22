"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

// ─── Static content ───────────────────────────────────────────────────────────

const STYLE_LABELS: Record<string, string> = {
  anxious: "Anxious Attachment",
  avoidant: "Avoidant Attachment",
  secure: "Secure Attachment",
  disorganized: "Disorganized Attachment",
};

const DAILY_REMINDERS: Record<string, string[]> = {
  anxious: [
    "Today, notice when you reach for your phone to check on them — and pause for one breath before you do.",
    "If you feel the urge to send a message, write it in your journal instead. You don't have to send everything you feel.",
    "Reassurance you give yourself lasts longer than reassurance you ask for. Try once today.",
    "You are not too much. You just loved someone who couldn't hold it.",
  ],
  avoidant: [
    "Today, let yourself feel one thing fully — without immediately moving on from it.",
    "Tell one person how you actually are. Not 'fine.' The real answer.",
    "Busyness is not the same as healing. Notice when you're using one for the other.",
    "You're allowed to need people. It won't make you weak.",
  ],
  secure: [
    "Your ability to process this is a strength. Let the grief move at its own pace today.",
    "Notice what this relationship taught you about what you need. That knowledge is yours to keep.",
    "Reach out to someone you trust today. You don't have to carry this alone.",
    "You will love again — and you'll do it with everything you learned here.",
  ],
  disorganized: [
    "Contradictory feelings are allowed to coexist. You don't have to resolve them today.",
    "Before any big decision today, pause and ask: am I acting from fear or from clarity?",
    "Write what you feel — even if it doesn't make sense. Especially if it doesn't make sense.",
    "Your nervous system is trying to keep you safe. Thank it — then gently redirect it.",
  ],
};

const DAILY_TASKS: Record<string, string[]> = {
  anxious: [
    "Don't check their profile today. Just today.",
    "Write down one thing you like about yourself — unrelated to any relationship.",
    "Reach out to a friend you haven't spoken to this week.",
    "Go one hour without checking your phone. Notice how it feels.",
    "Write a letter to your past self. You don't have to send it.",
  ],
  avoidant: [
    "Tell one person something real about how you're feeling.",
    "Sit with a feeling for five minutes without distracting yourself.",
    "Text someone you care about first — don't wait for them to reach out.",
    "Write about what you actually want from a relationship. Be honest.",
    "Do something kind for yourself that isn't productivity.",
  ],
  secure: [
    "Journal about one thing this relationship taught you.",
    "Call or text someone who makes you feel safe.",
    "Do one thing today that is entirely for you.",
    "Write about what you're looking forward to — however small.",
    "Acknowledge one way you've grown through this.",
  ],
  disorganized: [
    "Ground yourself: name 5 things you can see right now.",
    "Write whatever comes — no structure, no editing.",
    "Reach out to one person who feels consistent and safe.",
    "Take a slow walk without your phone.",
    "Write about a moment you felt truly at peace. What made it that way?",
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function getDayTask(style: string, day: number) {
  const tasks = DAILY_TASKS[style] ?? DAILY_TASKS.anxious;
  return tasks[(day - 1) % tasks.length];
}

function getDayReminder(style: string, day: number) {
  const reminders = DAILY_REMINDERS[style] ?? DAILY_REMINDERS.anxious;
  return reminders[(day - 1) % reminders.length];
}

function moodToValue(mood: string) {
  if (mood === "Better") return 1;
  if (mood === "Same") return 0;
  if (mood === "Harder") return -1;
  return 0;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs tracking-[0.18em] uppercase text-haven-sand font-semibold mb-4">
      {children}
    </p>
  );
}

function Card({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <section
      className="rounded-3xl p-7 transition-all duration-300"
      style={{ backgroundColor: accent ? "#F8F1E5" : "#FDF8F2" }}
    >
      {children}
    </section>
  );
}

function CheckInCard({
  onSelect,
  initial,
}: {
  onSelect: (mood: Mood) => void;
  initial?: Mood;
}) {
  const [selected, setSelected] = useState<Mood | null>(initial ?? null);
  const options: Mood[] = ["Better", "Same", "Harder", "Not sure"];

  const handleSelect = (opt: Mood) => {
    setSelected(opt);
    onSelect(opt);
  };

  return (
    <Card>
      <Label>How are you feeling right now?</Label>
      <div className="flex flex-wrap gap-2.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            className={`px-5 py-2.5 rounded-full text-sm border transition-all duration-300 ${
              selected === opt
                ? "bg-haven-blue text-white border-haven-blue"
                : "bg-transparent text-haven-text border-haven-text/15 hover:border-haven-blue-deep"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {selected && (
        <p className="mt-4 text-xs text-haven-text/40">
          Saved. Come back tomorrow to check in again.
        </p>
      )}
    </Card>
  );
}

function TaskCard({ task }: { task: string }) {
  const [done, setDone] = useState(false);
  return (
    <Card>
      <Label>Today&apos;s task</Label>
      <div className={`flex items-start justify-between gap-5 transition-opacity duration-300 ${done ? "opacity-60" : ""}`}>
        <p className="font-heading text-xl text-haven-text leading-relaxed flex-1">
          {task}
        </p>
        <button
          onClick={() => setDone(!done)}
          className={`flex-shrink-0 mt-1 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            done ? "bg-haven-blue border-haven-blue" : "border-haven-text/20 hover:border-haven-blue-deep"
          }`}
          aria-label="Mark task done"
        >
          {done && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7.5L5.5 11L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
      {done && <p className="mt-4 text-sm text-haven-text/50">✓ Done for today</p>}
    </Card>
  );
}

function TrendCard({
  trend,
  journalStreak,
  tasksCompleted,
}: {
  trend: { date: string; mood: string }[];
  journalStreak: number;
  tasksCompleted: number;
}) {
  const width = 480;
  const height = 140;
  const padX = 36;
  const padY = 20;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  // Use last 7 entries or pad with nulls
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const last7 = trend.slice(-7);

  const points = last7.map((d, i) => {
    const x = padX + (i * innerW) / Math.max(last7.length - 1, 1);
    const y = padY + ((1 - moodToValue(d.mood)) / 2) * innerH;
    const day = days[new Date(d.date).getDay() === 0 ? 6 : new Date(d.date).getDay() - 1];
    return { x, y, day };
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  if (trend.length === 0) {
    return (
      <Card>
        <Label>Your week</Label>
        <p className="text-haven-text/40 text-sm font-body">
          Check in each day — your emotional trend will appear here.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-haven-text/5">
          <div className="text-haven-text font-heading">
            Journal streak: <span className="text-haven-sand">{journalStreak} days</span>
          </div>
          <div className="text-haven-text font-heading">
            Tasks completed: <span className="text-haven-sand">{tasksCompleted}</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Label>Your week</Label>
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height + 24}`} className="w-full h-auto">
          <text x={padX - 4} y={padY + 4} fontSize="9" fill="#C4A882" textAnchor="end" fontFamily="Nunito">Better</text>
          <text x={padX - 4} y={padY + innerH / 2 + 4} fontSize="9" fill="#C4A882" textAnchor="end" fontFamily="Nunito">Same</text>
          <text x={padX - 4} y={padY + innerH + 4} fontSize="9" fill="#C4A882" textAnchor="end" fontFamily="Nunito">Harder</text>
          {points.length > 1 && (
            <path d={path} stroke="#A8C5DA" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#A8C5DA" />
          ))}
          {points.map((p, i) => (
            <text key={i} x={p.x} y={height + 14} fontSize="10" fill="#2D3748" opacity="0.4" textAnchor="middle" fontFamily="Nunito">
              {p.day}
            </text>
          ))}
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-haven-text/5">
        <div className="text-haven-text font-heading">
          Journal streak: <span className="text-haven-sand">{journalStreak} days</span>
        </div>
        <div className="text-haven-text font-heading">
          Tasks completed: <span className="text-haven-sand">{tasksCompleted}</span>
        </div>
      </div>
    </Card>
  );
}

function ReminderCard({ reminder }: { reminder: string }) {
  return (
    <Card accent>
      <p className="font-heading text-lg text-haven-text leading-relaxed italic">
        {reminder}
      </p>
    </Card>
  );
}

function JournalCard({ assessmentId }: { assessmentId: string }) {
  const [entry, setEntry] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!entry.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/journal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: entry, assessmentId }),
      });
      setSaved(true);
      setEntry("");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // silent fail for now
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <Label>Your journal</Label>
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="What's on your mind today..."
        rows={5}
        className="w-full rounded-2xl border border-haven-text/10 p-4 text-haven-text placeholder:text-haven-text/35 focus:outline-none focus:border-haven-blue-deep resize-none transition-colors duration-300"
        style={{ backgroundColor: "#F0EDE6" }}
      />
      <button
        onClick={handleSave}
        disabled={saving || !entry.trim()}
        className="mt-4 px-7 py-3 rounded-full bg-haven-blue text-white text-sm hover:bg-haven-blue-deep transition-colors duration-300 disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Saved ✓" : "Save entry"}
      </button>
      <p className="mt-3 text-xs text-haven-text/45">
        AI will reflect on this after you save.
      </p>
    </Card>
  );
}

function TalkCard() {
  return (
    <Card>
      <h2 className="font-heading text-2xl text-haven-text mb-2">Need to talk?</h2>
      <p className="text-haven-text/60 leading-relaxed mb-5 text-sm">
        Haven is here. No advice, no judgment. Just a space to think out loud.
      </p>
      <Link
        href="/chat"
        className="inline-block px-7 py-3 rounded-full bg-haven-blue text-white text-sm hover:bg-haven-blue-deep transition-colors duration-300"
      >
        Start a conversation
      </Link>
      <p className="mt-3 text-xs text-haven-text/45">10 messages remaining</p>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-haven-bg flex items-center justify-center">
      <p className="font-heading italic text-haven-text/40 text-xl animate-pulse">
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

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/dashboard");
      return;
    }
    fetchDashboardData();
  }, [status]);

  async function fetchDashboardData() {
    try {
      const res = await fetch("/api/assessment/latest");
      if (res.ok) {
        const data = await res.json();
        if (data.assessment) {
          setAssessment(data.assessment);
        } else {
          // No assessment — send them to take it
          router.push("/");
          return;
        }
      }
      // Progress fetch — will build this route next
      const pRes = await fetch("/api/progress/get");
      if (pRes.ok) {
        const pData = await pRes.json();
        setProgress(pData.progress);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  const handleMoodSelect = async (mood: Mood) => {
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

  if (status === "loading" || loading) return <DashboardSkeleton />;
  if (!assessment) return null;

  const style = assessment.attachmentStyle;
  const day = progress?.currentDay ?? 1;
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const greeting = getGreeting();
  const task = getDayTask(style, day);
  const reminder = getDayReminder(style, day);
  const trend = progress?.emotionalTrend ?? [];
  const todayMood = trend.length > 0
    ? (trend[trend.length - 1].date.startsWith(new Date().toISOString().split("T")[0])
      ? trend[trend.length - 1].mood as Mood
      : undefined)
    : undefined;

  return (
    <div className="min-h-screen bg-haven-bg">
      <main className="max-w-[600px] mx-auto px-6 pt-16 pb-24">

        {/* Greeting */}
        <header className="mb-16">
          <h1 className="font-heading text-4xl md:text-5xl text-haven-text leading-tight">
            {greeting}, {firstName}.
          </h1>
          <p className="mt-4 font-heading italic text-lg text-haven-text/55">
            Day {day}. You&apos;re still here. That matters.
          </p>
        </header>

        <div className="flex flex-col gap-8">
          <CheckInCard onSelect={handleMoodSelect} initial={todayMood} />
          <TaskCard task={task} />
          <TrendCard
            trend={trend}
            journalStreak={progress?.journalStreak ?? 0}
            tasksCompleted={progress?.tasksCompleted ?? 0}
          />
          <ReminderCard reminder={reminder} />
          <JournalCard assessmentId={assessment.id} />
          <TalkCard />
        </div>

        <footer className="mt-20 text-center">
          <p className="font-heading italic text-haven-text/50">
            You showed up today. That&apos;s enough.
          </p>
        </footer>

      </main>
    </div>
  );
}