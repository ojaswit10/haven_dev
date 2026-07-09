// app/api/chat/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  // Verify ownership
  const chatSession = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    select: { userId: true },
  });

  if (!chatSession || chatSession.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { chatSessionId: sessionId },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true, createdAt: true },
  });

  // Map to frontend shape
  const formatted = messages.map((m) => ({
    id: m.id,
    role: m.role === "assistant" ? "haven" : "user",
    text: m.content,
    createdAt: m.createdAt.toISOString(),
  }));

  return NextResponse.json({ messages: formatted });
}