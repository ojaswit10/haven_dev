// app/api/journal/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, mood, title } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }

  const entry = await prisma.journalEntry.create({
    data: {
      userId: session.user.id,
      content: content.trim(),
      mood: mood ?? "same",
      title: title?.trim() || null,
    },
  });

  // Update journal entry count on progress
  const assessment = await prisma.assessment.findFirst({
    where: { userId: session.user.id, status: "active" },
    orderBy: { createdAt: "desc" },
  });

  if (assessment) {
    const progress = await prisma.progress.findUnique({
      where: { assessmentId: assessment.id },
    });

    if (progress) {
      await prisma.progress.update({
        where: { id: progress.id },
        data: { journalStreak: { increment: 1 } },
      });
    }
  }

  return NextResponse.json({ success: true, entry });
}