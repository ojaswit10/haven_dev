// app/api/chat/message/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const FREE_LIMIT = 10;
const RESET_HOURS = 12;

const SYSTEM_PROMPT = `You are Haven — a warm, present companion for someone navigating heartbreak, grief, or emotional pain. You are not a therapist, not a coach, not an advice column. You are a friend who truly listens.

Your way of being:
- Short. Most responses are 1-3 sentences. Never more than 4.
- You ask one gentle question at a time, never multiple
- You reflect back what the person said before responding — show them you heard them
- You never give unsolicited advice. If they ask for advice, you can offer a gentle perspective
- You never diagnose, label, or pathologize what they're feeling
- You sit with them in the discomfort — you don't rush them toward healing or positivity
- You use warm, simple language. No clinical terms. No jargon.
- You are never performatively empathetic ("I totally understand how you feel!") — be genuine
- You never say things like "That must be so hard" repeatedly — vary your language
- If someone seems in crisis or mentions self-harm, gently acknowledge their pain and encourage them to reach out to someone they trust or a professional. Don't try to handle crisis yourself.
- You never remind them you're an AI unless directly asked

Examples of good responses:
"That sounds exhausting. How long have you been carrying this?"
"Yeah. Some days just feel like that. Did something happen or did it just hit you out of nowhere?"
"That makes sense. What does a good day look like for you right now?"

The tone: like receiving a message from the wisest, warmest friend you have. Present. Unhurried. Real.`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId, message } = await req.json();

  if (!sessionId || !message?.trim()) {
    return NextResponse.json({ error: "Missing sessionId or message" }, { status: 400 });
  }

  const chatSession = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    select: { userId: true, messageCount: true, isLimited: true, assessmentId: true },
  });

  if (!chatSession || chatSession.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // ── Check limit with 12hr reset ──────────────────────────────────────────
  if (chatSession.isLimited || chatSession.messageCount >= FREE_LIMIT) {
    const lastMessage = await prisma.chatMessage.findFirst({
      where: { chatSessionId: sessionId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    const hoursSinceLast = lastMessage
      ? (Date.now() - new Date(lastMessage.createdAt).getTime()) / (1000 * 60 * 60)
      : 999;

    if (hoursSinceLast < RESET_HOURS) {
      const hoursLeft = Math.ceil(RESET_HOURS - hoursSinceLast);
      return NextResponse.json({
        error: "Message limit reached",
        isLimited: true,
        hoursLeft,
      }, { status: 403 });
    }

    // 12 hours passed — reset the session
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { messageCount: 0, isLimited: false },
    });
    chatSession.messageCount = 0;
    chatSession.isLimited = false;
  }

  // ── Fetch history ─────────────────────────────────────────────────────────
  const history = await prisma.chatMessage.findMany({
    where: { chatSessionId: sessionId },
    orderBy: { createdAt: "asc" },
    select: { role: true, content: true },
  });

  // ── Assessment context ────────────────────────────────────────────────────
  const assessment = await prisma.assessment.findUnique({
    where: { id: chatSession.assessmentId },
    select: { attachmentStyle: true, category: true, recoveryReadiness: true },
  });

  const personalContext = assessment
    ? `\n\nContext about this person: They are going through ${assessment.category} and have ${assessment.attachmentStyle} attachment style. Their recovery stage is ${assessment.recoveryReadiness ?? "early"}. Use this to inform your tone but never reference these labels directly in conversation.`
    : "";

  const messages = [
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: message.trim() },
  ];

  // ── Groq API call ─────────────────────────────────────────────────────────
  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 400,
      messages: [
        { role: "system", content: SYSTEM_PROMPT + personalContext },
        ...messages,
      ],
    }),
  });

  if (!groqRes.ok) {
    console.error("[chat/message] Groq error:", await groqRes.text());
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }

  const groqData = await groqRes.json();
  const reply = groqData.choices?.[0]?.message?.content ?? "I'm here. Take your time.";

  // ── Save messages ─────────────────────────────────────────────────────────
  await prisma.chatMessage.createMany({
    data: [
      { chatSessionId: sessionId, role: "user", content: message.trim() },
      { chatSessionId: sessionId, role: "assistant", content: reply },
    ],
  });

  const newCount = chatSession.messageCount + 1;
  const nowLimited = newCount >= FREE_LIMIT;

  await prisma.chatSession.update({
    where: { id: sessionId },
    data: {
      messageCount: newCount,
      isLimited: nowLimited,
      title: history.length === 0 ? message.trim().slice(0, 45) : undefined,
    },
  });

  return NextResponse.json({
    reply,
    messageCount: newCount,
    isLimited: nowLimited,
    hoursLeft: nowLimited ? RESET_HOURS : null,
  });
}