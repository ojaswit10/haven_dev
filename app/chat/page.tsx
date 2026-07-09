"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = {
  id: string;
  role: "haven" | "user";
  text: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  title: string;
  messageCount: number;
  isLimited: boolean;
  createdAt: string;
  messages: Message[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const FREE_LIMIT = 10;
const RESET_HOURS = 24;

const STARTERS = [
  "I need to talk about something that happened",
  "I\u2019ve been feeling really low lately",
  "Help me understand what I\u2019m feeling",
  "I just need someone to listen",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatSidebarDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const diff = (Date.now() - d.getTime()) / 86400000;
  if (diff < 1) return "Today";
  if (diff < 2) return "Yesterday";
  if (diff < 7) return `${Math.floor(diff)} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const HCircle = ({ size = 32 }: { size?: number }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: "#A8C5DA",
      color: "#FDF8F2",
      fontFamily: "Georgia, serif",
      fontSize: size * 0.5,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      lineHeight: 1,
    }}
  >
    h
  </div>
);

const TypingDots = () => (
  <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "8px 0" }}>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: "#A8C5DA",
          display: "block",
          animation: `havenDot 1.4s ease-in-out ${i * 0.2}s infinite`,
        }}
      />
    ))}
  </div>
);


function LimitBanner({ name, hoursLeft }: { name: string; hoursLeft: number | null }) {
  return (
    <div style={{
      margin: "0 40px 16px",
      padding: "16px 20px",
      backgroundColor: "#FDF8F2",
      borderRadius: 16,
      border: "1px solid rgba(168,197,218,0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    }}>
      <div>
        <p style={{ fontSize: 13, color: "#2D3748", fontFamily: "Georgia,serif", marginBottom: 3 }}>
          {`You've reached today's limit, ${name}.`}
        </p>
        <p style={{ fontSize: 12, color: "rgba(45,55,72,0.5)", lineHeight: 1.5 }}>
          {hoursLeft !== null
            ? `Come back in ${hoursLeft} ${hoursLeft === 1 ? "hour" : "hours"} — Haven will be here. Or continue anytime with a full account.`
            : `Come back tomorrow — Haven will be here. Or continue anytime with a full account.`}
        </p>
      </div>
      <button
        style={{
          padding: "8px 16px",
          backgroundColor: "transparent",
          border: "1px solid #A8C5DA",
          borderRadius: 20,
          fontSize: 12,
          color: "#7BA7C2",
          cursor: "pointer",
          whiteSpace: "nowrap",
          fontFamily: "inherit",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(168,197,218,0.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        {`Unlock more \u2192`}
      </button>
    </div>
  );
}
// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ChatSkeleton() {
  return (
    <div style={{ height: "100vh", backgroundColor: "#F0EDE6", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 18, color: "rgba(45,55,72,0.3)" }}>
        Opening your space...
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { data: session, status } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const isLimited = (active?.messageCount ?? 0) >= FREE_LIMIT || active?.isLimited;
  const [hoursLeft, setHoursLeft] = useState<number | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/chat");
      return;
    }
    fetchConversations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages?.length, typing]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/sessions");
      if (res.ok) {
        const data = await res.json();
        const sessionsWithMessages = (data.sessions ?? []).map((s: Conversation) => ({
          ...s,
          messages: s.messages ?? [],
        }));
        setConversations(sessionsWithMessages);
        if (sessionsWithMessages.length > 0) {
          setActiveId(sessionsWithMessages[0].id);
          await loadMessages(sessionsWithMessages[0].id);
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setConversations((prev) =>
          prev.map((c) =>
            c.id === sessionId ? { ...c, messages: data.messages ?? [] } : c
          )
        );
      }
    } catch {
      // silent
    }
  };

  const switchConversation = async (id: string) => {
    setActiveId(id);
    const conv = conversations.find((c) => c.id === id);
    if (!conv?.messages?.length) {
      await loadMessages(id);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const newConversation = async () => {
    try {
      const res = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "A new beginning" }),
      });
      if (res.ok) {
        const data = await res.json();
        const newConv: Conversation = {
          ...data.session,
          messages: [],
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveId(newConv.id);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } catch {
      // silent
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || !activeId || sending || isLimited) return;

    const userMsg: Message = {
      id: Math.random().toString(36).slice(2),
      role: "user",
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    // Optimistically add user message
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              title: c.messages.length === 0 ? text.trim().slice(0, 45) : c.title,
              messages: [...(c.messages ?? []), userMsg],
              messageCount: c.messageCount + 1,
            }
          : c
      )
    );
    setDraft("");
    setTyping(true);
    setSending(true);

    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeId, message: text.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        const havenMsg: Message = {
          id: Math.random().toString(36).slice(2),
          role: "haven",
          text: data.reply,
          createdAt: new Date().toISOString(),
        };

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  messages: [...(c.messages ?? []), havenMsg],
                  messageCount: data.messageCount ?? c.messageCount,
                  isLimited: data.isLimited ?? false,
                }
              : c
          )
        );
      }
      if (res.status === 403) {
      const data = await res.json();
      setHoursLeft(data.hoursLeft ?? RESET_HOURS);
}
      
    } catch {
      // silent
    } finally {
      setTyping(false);
      setSending(false);
    }
  };

  if (status === "loading" || loading) return <ChatSkeleton />;
  

  return (
    <div style={{ height: "100vh", width: "100%", display: "flex", backgroundColor: "#F0EDE6", color: "#2D3748", fontFamily: "'DM Sans', Nunito, sans-serif", overflow: "hidden" }}>

      <style>{`
        @keyframes havenDot {
          0%, 60%, 100% { opacity: 0.25; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
        @keyframes havenFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .haven-msg { animation: havenFadeUp 300ms ease-out both; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(45,55,72,0.1); border-radius: 999px; }
      `}</style>

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#E4DDD3" }}>

        {/* Logo */}
        <div style={{ padding: "28px 24px 20px" }}>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 18, color: "#2D3748", letterSpacing: "0.02em" }}>
            haven
          </div>
        </div>

        {/* New conversation */}
        <div style={{ padding: "0 16px 16px" }}>
          <button
            onClick={newConversation}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: 999,
              backgroundColor: "#A8C5DA",
              color: "#2D3748",
              fontSize: 13,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#7BA7C2")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#A8C5DA")}
          >
            + New conversation
          </button>
        </div>

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
          {conversations.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 24px", textAlign: "center", gap: 12 }}>
              <HCircle size={36} />
              <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 13, color: "rgba(45,55,72,0.45)" }}>
                No conversations yet
              </p>
              <button
                onClick={newConversation}
                style={{ fontSize: 12, padding: "7px 16px", borderRadius: 999, backgroundColor: "#A8C5DA", color: "#2D3748", border: "none", cursor: "pointer", fontFamily: "inherit", marginTop: 4 }}
              >
                Start talking
              </button>
            </div>
          ) : (
            conversations.map((c) => {
              const isActive = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => switchConversation(c.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 16px",
                    marginBottom: 2,
                    borderRadius: "0 12px 12px 0",
                    borderLeft: `2px solid ${isActive ? "#A8C5DA" : "transparent"}`,
                    backgroundColor: isActive ? "rgba(168,197,218,0.18)" : "transparent",
                    cursor: "pointer",
                    border: "none",
                    borderLeftWidth: 2,
                    borderLeftStyle: "solid",
                    borderLeftColor: isActive ? "#A8C5DA" : "transparent",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "rgba(45,55,72,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <p style={{ fontSize: 13, color: "#2D3748", fontFamily: "Georgia,serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>
                    {c.title}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(45,55,72,0.45)" }}>
                    {formatSidebarDate(c.createdAt)}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Bottom identity */}
        <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(45,55,72,0.06)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <HCircle size={36} />
          <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C4A882" }}>
            Haven
          </p>
        </div>
      </aside>

      {/* ── Chat area ───────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", minWidth: 0 }}>

        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", borderBottom: "1px solid rgba(45,55,72,0.06)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <HCircle size={44} />
            <div>
              <p style={{ fontFamily: "Georgia,serif", fontSize: 17, color: "#2D3748", lineHeight: 1.2 }}>Haven</p>
              <p style={{ fontSize: 12, fontStyle: "italic", color: "rgba(45,55,72,0.45)" }}>Your companion \u2014 always here</p>
            </div>
          </div>
          {active && (
            <p style={{ fontSize: 12, color: "rgba(45,55,72,0.4)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {active.title}
            </p>
          )}
        </header>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "40px 40px 20px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>

            {!active || active.messages.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 28 }}>
                <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 18, color: "rgba(45,55,72,0.5)", textAlign: "center" }}>
                  What\u2019s here for you today?
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", maxWidth: 580 }}>
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      style={{
                        textAlign: "left",
                        padding: "18px 20px",
                        borderRadius: 18,
                        backgroundColor: "#FDF8F2",
                        border: "1px solid rgba(45,55,72,0.06)",
                        fontFamily: "Georgia,serif",
                        fontStyle: "italic",
                        fontSize: 14,
                        color: "#2D3748",
                        cursor: "pointer",
                        lineHeight: 1.5,
                        transition: "background 0.15s",
                        fontWeight: 400,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8F1E5")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FDF8F2")}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              active.messages.map((m) =>
                m.role === "haven" ? (
                  <div key={m.id} className="haven-msg" style={{ display: "flex", gap: 16 }}>
                    <HCircle size={32} />
                    <div style={{
                      flex: 1,
                      paddingLeft: 20,
                      borderLeft: "2px solid #A8C5DA",
                      fontFamily: "Georgia,serif",
                      lineHeight: 1.85,
                      color: "#2D3748",
                      fontSize: 16,
                    }}>
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="haven-msg" style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{
                      maxWidth: "72%",
                      padding: "14px 20px",
                      borderRadius: 20,
                      backgroundColor: "#FDF8F2",
                      border: "1px solid rgba(45,55,72,0.08)",
                      fontSize: 15,
                      lineHeight: 1.6,
                      color: "#2D3748",
                    }}>
                      {m.text}
                    </div>
                  </div>
                )
              )
            )}

            {typing && (
              <div className="haven-msg" style={{ display: "flex", gap: 16 }}>
                <HCircle size={32} />
                <div style={{ paddingLeft: 20, borderLeft: "2px solid #A8C5DA" }}>
                  <TypingDots />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Limit banner */}
        {isLimited && <LimitBanner name={firstName} hoursLeft={hoursLeft} />}

        {/* Input */}
        <div style={{ padding: "8px 40px 28px", flexShrink: 0 }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderRadius: 20,
              padding: "12px 16px",
              backgroundColor: "#F8F1E5",
              border: "1px solid rgba(45,55,72,0.05)",
              boxShadow: "0 -4px 20px rgba(45,55,72,0.04)",
              opacity: isLimited ? 0.5 : 1,
            }}>
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(draft);
                  }
                }}
                placeholder={isLimited ? "You\u2019ve reached today\u2019s limit..." : "Say whatever is on your mind..."}
                disabled={isLimited || sending}
                style={{
                  flex: 1,
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 15,
                  fontStyle: "italic",
                  color: "#2D3748",
                  fontFamily: "inherit",
                  cursor: isLimited ? "default" : "text",
                }}
              />
              {draft.trim().length > 0 && !isLimited && (
                <button
                  onClick={() => sendMessage(draft)}
                  disabled={sending}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    backgroundColor: "#A8C5DA",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#7BA7C2")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#A8C5DA")}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M2.5 7.5h10M9 3.5l4 4-4 4" stroke="#FDF8F2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
            <p style={{ fontSize: 11, textAlign: "center", marginTop: 10, color: "rgba(45,55,72,0.4)" }}>
            {isLimited
              ? `Come back tomorrow — Haven will be here.`
              : `Haven remembers this conversation · ${Math.max(0, FREE_LIMIT - (active?.messageCount ?? 0))} messages remaining`}
          </p>
          </div>
        </div>

      </main>
    </div>
  );
}