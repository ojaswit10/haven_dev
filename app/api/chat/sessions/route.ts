// app/api/chat/sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — list all chat sessions for user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await prisma.chatSession.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      messageCount: true,
      isLimited: true,
      createdAt: true,
      updatedAt: true,
      assessmentId: true,
    },
  });

  return NextResponse.json({ sessions });
}

// POST — create new chat session
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title } = await req.json();

  // Get active assessment
  const assessment = await prisma.assessment.findFirst({
    where: { userId: session.user.id, status: "active" },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (!assessment) {
    return NextResponse.json({ error: "No active assessment" }, { status: 404 });
  }

  const chatSession = await prisma.chatSession.create({
    data: {
      userId: session.user.id,
      assessmentId: assessment.id,
      title: title ?? "A new beginning",
      messageCount: 0,
      isLimited: false,
    },
  });

  return NextResponse.json({ session: chatSession });
}