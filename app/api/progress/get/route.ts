import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assessment = await prisma.assessment.findFirst({
    where: { userId: session.user.id, status: "active" },
    orderBy: { createdAt: "desc" },
  });

  if (!assessment) {
    return NextResponse.json({ progress: null });
  }

  // Try to find existing first — avoids upsert race condition
  let progress = await prisma.progress.findUnique({
    where: { assessmentId: assessment.id },
  });

  if (!progress) {
    try {
      progress = await prisma.progress.create({
        data: {
          userId: session.user.id,
          assessmentId: assessment.id,
          currentDay: 1,
          dayStreak: 0,
          journalStreak: 0,
          tasksCompleted: 0,
          emotionalTrend: [],
          status: "active",
        },
      });
    } catch {
      // Already created by concurrent request — fetch it
      progress = await prisma.progress.findUnique({
        where: { assessmentId: assessment.id },
      });
    }
  }

  if (!progress) {
    return NextResponse.json({ progress: null });
  }

  const daysSinceStart = Math.floor(
    (Date.now() - new Date(progress.startedAt).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  if (daysSinceStart !== progress.currentDay) {
    progress = await prisma.progress.update({
      where: { id: progress.id },
      data: { currentDay: daysSinceStart },
    });
  }

  return NextResponse.json({ progress });
}