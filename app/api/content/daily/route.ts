// app/api/content/daily/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDailyQuote, getDailyTasks } from "@/lib/content";
import type { AttachmentStyle } from "@/lib/content";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get active assessment for attachment style
  const assessment = await prisma.assessment.findFirst({
    where: { userId: session.user.id, status: "active" },
    orderBy: { createdAt: "desc" },
    select: {
      attachmentStyle: true,
      recoveryReadiness: true,
    },
  });

  if (!assessment) {
    return NextResponse.json({ error: "No active assessment" }, { status: 404 });
  }

  // Get progress for current day
  const progress = await prisma.progress.findFirst({
    where: { userId: session.user.id, status: "active" },
    orderBy: { startedAt: "desc" },
    select: { currentDay: true },
  });

  const day = progress?.currentDay ?? 1;
  const style = assessment.attachmentStyle as AttachmentStyle;

  // Map recoveryReadiness from assessment to stage
  const stageMap: Record<string, "early" | "processing" | "ready"> = {
    early: "early",
    processing: "processing",
    ready: "ready",
  };
  const stage = stageMap[assessment.recoveryReadiness ?? "early"] ?? "early";

  const quote = getDailyQuote(style, stage, day);
  const tasks = getDailyTasks(style, stage, day, 4);

  return NextResponse.json({ quote, tasks, day });
}