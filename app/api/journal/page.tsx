"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface JournalEntry {
  id: string;
  content: string;
  mood: string;
  title?: string;
  createdAt: string;
  dayNumber?: number;
}

type JournalMood = "better" | "same" | "harder";

// ─── Color tokens ─────────────────────────────────────────────────────────────

const C = {
  bg: "#EDE8DF",
  sidebar: "#E4DDD3",
  page: "#FBF7F0",
  pageLines: "rgba(196,168,130,0.15)",
  card: "#FDF8F2",
  blue: "#A8C5DA",
  blueDark: "#7BA7C2",
  sand: "#C4A882",
  text: "#2D3748",
  muted: "rgba(45,55,72,0.45)",
  hint: "rgba(45,55,72,0.28)",
  faint: "rgba(45,55,72,0.08)",
  border: "rgba(45,55,72,0.1)",
  activeEntry: "rgba(168,197,218,0.18)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDayLabel(entry: JournalEntry, index: number) {
  return `Day ${entry.dayNumber ?? index + 1}`;
}

function getWordCount(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

const MOOD_OPTIONS: { value: JournalMood; label: string; color: string }[] = [
  { value: "better", label: "Better", color: "#A8C5DA" },
  { value: "same", label: "Same", color: "#C4A882" },
  { value: "harder", label: "Harder", color: "#E8B4A0" },
];

// ─── Ruled lines background ───────────────────────────────────────────────────

function RuledPage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Subtle ruled lines */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `repeating-linear-gradient(
          to bottom,
          transparent,
          transparent 31px,
          ${C.pageLines} 31px,
          ${C.pageLines} 32px
        )`,
        backgroundPositionY: "40px",
        pointerEvents: "none",
        borderRadius: 4,
      }} />
      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 48,
      textAlign: "center",
    }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        backgroundColor: "rgba(168,197,218,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke={C.blue} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p style={{ fontFamily: "Georgia,serif", fontSize: 20, color: C.text, marginBottom: 8 }}>
        Your journal is empty.
      </p>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, maxWidth: 280, marginBottom: 28 }}>
        This is your space. Write whatever you need to — there are no rules here.
      </p>
      <button
        onClick={onNew}
        style={{
          padding: "10px 24px",
          backgroundColor: C.blue,
          color: "#FDF8F2",
          border: "none",
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Write your first entry
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function JournalPage() {
  const { status } = useSession();
  const router = useRouter();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editing state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<JournalMood>("same");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/api/journal");
      return;
    }
    fetchEntries();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  async function fetchEntries() {
    try {
      const res = await fetch("/api/journal/list");
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries ?? []);
        // Open most recent entry by default
        if (data.entries?.length > 0) {
          openEntry(data.entries[0]);
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  function openEntry(entry: JournalEntry) {
    setActiveId(entry.id);
    setIsNew(false);
    setTitle(entry.title ?? "");
    setContent(entry.content);
    setMood((entry.mood as JournalMood) ?? "same");
  }

  function startNew() {
    setActiveId(null);
    setIsNew(true);
    setTitle("");
    setContent("");
    setMood("same");
    setTimeout(() => textareaRef.current?.focus(), 100);
  }

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);

    try {
      if (isNew) {
        const res = await fetch("/api/journal/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, mood, title }),
        });
        if (res.ok) {
          const data = await res.json();
          const newEntry = { ...data.entry, title };
          setEntries((prev) => [newEntry, ...prev]);
          setActiveId(newEntry.id);
          setIsNew(false);
        }
      } else {
        // Edit existing
        const res = await fetch(`/api/journal/update`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: activeId, content, mood, title }),
        });
        if (res.ok) {
          setEntries((prev) =>
            prev.map((e) =>
              e.id === activeId ? { ...e, content, mood, title } : e
            )
          );
        }
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  const activeEntry = entries.find((e) => e.id === activeId);
  const showEditor = isNew || activeEntry;
  const currentDay = (isNew
    ? entries.length + 1
    : entries.findIndex((e) => e.id === activeId) !== -1
    ? entries.length - entries.findIndex((e) => e.id === activeId)
    : entries.length + 1);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 18, color: C.hint }}>
          Opening your journal...
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg, display: "flex", flexDirection: "column" }}>
      <main style={{
        flex: 1,
        maxWidth: 1100,
        width: "100%",
        margin: "0 auto",
        padding: "32px 24px 48px",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Header */}
        <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.sand, fontWeight: 600, marginBottom: 6 }}>
              Haven
            </p>
            <h1 style={{ fontFamily: "Georgia,serif", fontSize: 28, color: C.text, fontWeight: 500 }}>
              Your Journal
            </h1>
          </div>
          <button
            onClick={startNew}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 18px",
              backgroundColor: C.blue,
              color: "#FDF8F2",
              border: "none",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v11M1 6.5h11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            New entry
          </button>
        </div>

        {/* Book layout */}
        <div style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(45,55,72,0.1)",
          minHeight: 640,
        }}>

          {/* ── Sidebar ────────────────────────────────────────────────── */}
          <div style={{
            backgroundColor: C.sidebar,
            borderRight: `1px solid ${C.border}`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>
            {/* Sidebar header */}
            <div style={{
              padding: "20px 18px 16px",
              borderBottom: `1px solid ${C.border}`,
            }}>
              <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.sand, fontWeight: 600 }}>
                {entries.length} {entries.length === 1 ? "entry" : "entries"}
              </p>
            </div>

            {/* Entry list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
              {entries.length === 0 && !isNew && (
                <p style={{ fontSize: 12, color: C.hint, padding: "16px 18px", lineHeight: 1.6 }}>
                  No entries yet. Start writing.
                </p>
              )}

              {/* New entry in progress */}
              {isNew && (
                <div style={{
                  padding: "12px 18px",
                  backgroundColor: C.activeEntry,
                  borderLeft: `3px solid ${C.blue}`,
                  cursor: "pointer",
                }}>
                  <p style={{ fontSize: 11, color: C.blue, fontWeight: 600, marginBottom: 3 }}>
                    Day {entries.length + 1}
                  </p>
                  <p style={{ fontSize: 13, color: C.text, fontFamily: "Georgia,serif" }}>
                    {title || "Untitled"}
                  </p>
                  <p style={{ fontSize: 11, color: C.hint, marginTop: 3 }}>Just now</p>
                </div>
              )}

              {entries.map((entry, index) => {
                const isActive = entry.id === activeId;
                const dayLabel = formatDayLabel(entry, entries.length - 1 - index);
                return (
                  <div
                    key={entry.id}
                    onClick={() => openEntry(entry)}
                    style={{
                      padding: "12px 18px",
                      cursor: "pointer",
                      backgroundColor: isActive ? C.activeEntry : "transparent",
                      borderLeft: `3px solid ${isActive ? C.blue : "transparent"}`,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "rgba(45,55,72,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                      <p style={{ fontSize: 11, color: isActive ? C.blue : C.sand, fontWeight: 600 }}>
                        {dayLabel}
                      </p>
                      {entry.mood && (
                        <div style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: MOOD_OPTIONS.find((m) => m.value === entry.mood)?.color ?? C.sand,
                          flexShrink: 0,
                        }} />
                      )}
                    </div>
                    <p style={{
                      fontSize: 13,
                      color: C.text,
                      fontFamily: "Georgia,serif",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {entry.title || "Untitled"}
                    </p>
                    <p style={{ fontSize: 11, color: C.hint, marginTop: 3 }}>
                      {formatDate(entry.createdAt)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Writing pane ────────────────────────────────────────────── */}
          <div style={{
            backgroundColor: C.page,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>
            {!showEditor ? (
              <EmptyState onNew={startNew} />
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>

                {/* Page header */}
                <div style={{
                  padding: "28px 40px 0",
                  borderBottom: `1px solid ${C.pageLines}`,
                  paddingBottom: 20,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: C.blue,
                        backgroundColor: "rgba(168,197,218,0.12)",
                        padding: "4px 10px",
                        borderRadius: 20,
                      }}>
                        Day {currentDay}
                      </span>
                      <span style={{ fontSize: 12, color: C.hint }}>
                        {isNew ? new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                          : formatDate(activeEntry?.createdAt ?? "")}
                      </span>
                    </div>
                    {/* Mood selector */}
                    <div style={{ display: "flex", gap: 6 }}>
                      {MOOD_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setMood(opt.value)}
                          style={{
                            padding: "5px 12px",
                            borderRadius: 20,
                            border: `1px solid ${mood === opt.value ? opt.color : "rgba(45,55,72,0.1)"}`,
                            backgroundColor: mood === opt.value ? `${opt.color}20` : "transparent",
                            color: mood === opt.value ? opt.color : C.hint,
                            fontSize: 12,
                            cursor: "pointer",
                            fontWeight: mood === opt.value ? 600 : 400,
                            transition: "all 0.15s",
                            fontFamily: "inherit",
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give this entry a title..."
                    style={{
                      width: "100%",
                      border: "none",
                      outline: "none",
                      backgroundColor: "transparent",
                      fontFamily: "Georgia,serif",
                      fontSize: 22,
                      color: C.text,
                      fontWeight: 500,
                      padding: 0,
                    }}
                  />
                </div>

                {/* Ruled writing area */}
                <div style={{ flex: 1, padding: "0 40px 32px", overflow: "auto" }}>
                  <RuledPage>
                    <textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write whatever comes. There are no rules here..."
                      style={{
                        width: "100%",
                        minHeight: 420,
                        border: "none",
                        outline: "none",
                        backgroundColor: "transparent",
                        fontFamily: "Georgia,serif",
                        fontSize: 15,
                        color: C.text,
                        lineHeight: "32px",
                        resize: "none",
                        padding: "8px 0 0",
                        overflow: "hidden",
                      }}
                    />
                  </RuledPage>
                </div>

                {/* Footer bar */}
                <div style={{
                  padding: "14px 40px",
                  borderTop: `1px solid ${C.pageLines}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: C.page,
                }}>
                  <p style={{ fontSize: 12, color: C.hint }}>
                    {getWordCount(content)} words
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <p style={{ fontSize: 12, color: C.hint }}>
                      {isNew ? "New entry" : `Last saved ${formatDate(activeEntry?.createdAt ?? "")}`}
                    </p>
                    <button
                      onClick={handleSave}
                      disabled={saving || !content.trim()}
                      style={{
                        padding: "9px 22px",
                        backgroundColor: content.trim() ? C.blue : "rgba(168,197,218,0.3)",
                        color: "#FDF8F2",
                        border: "none",
                        borderRadius: 11,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: content.trim() ? "pointer" : "default",
                        transition: "all 0.2s",
                        fontFamily: "inherit",
                      }}
                    >
                      {saving ? "Saving..." : isNew ? "Save entry" : "Save changes"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <p style={{
          textAlign: "center",
          marginTop: 24,
          fontFamily: "Georgia,serif",
          fontStyle: "italic",
          fontSize: 13,
          color: C.hint,
        }}>
          Everything you write here is yours alone.
        </p>

      </main>
    </div>
  );
}