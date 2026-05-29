// app/api/progress/checkin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mood } = await req.json();
  if (!mood) {
    return NextResponse.json({ error: "Missing mood" }, { status: 400 });
  }

  // Get active assessment
  const assessment = await prisma.assessment.findFirst({
    where: { userId: session.user.id, status: "active" },
    orderBy: { createdAt: "desc" },
  });

  if (!assessment) {
    return NextResponse.json({ error: "No active assessment" }, { status: 404 });
  }

  // Get progress
  const progress = await prisma.progress.findUnique({
    where: { assessmentId: assessment.id },
  });

  if (!progress) {
    return NextResponse.json({ error: "No progress found" }, { status: 404 });
  }

  const today = new Date().toISOString().split("T")[0];
  const trend = progress.emotionalTrend as { date: string; mood: string }[];

  // Check if already checked in today — update if so, append if not
  const todayIndex = trend.findIndex((t) => t.date === today);
  if (todayIndex >= 0) {
    trend[todayIndex].mood = mood;
  } else {
    trend.push({ date: today, mood });
  }

  // Update dayStreak — consecutive days with check-ins
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const hadYesterday = trend.some((t) => t.date === yesterday);
  const newStreak = todayIndex >= 0
    ? progress.dayStreak // already checked in today, streak unchanged
    : hadYesterday
    ? progress.dayStreak + 1
    : 1; // reset streak

  const updated = await prisma.progress.update({
    where: { id: progress.id },
    data: {
      emotionalTrend: trend,
      dayStreak: newStreak,
    },
  });

  return NextResponse.json({ success: true, progress: updated });
}