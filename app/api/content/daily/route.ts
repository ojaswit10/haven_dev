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
  const userId = session.user.id;

  const assessment = await prisma.assessment.findFirst({
    where: { userId: userId, status: "active" },
    orderBy: { createdAt: "desc" },
    select: { attachmentStyle: true, recoveryReadiness: true },
  });

  if (!assessment) {
    return NextResponse.json({ error: "No active assessment" }, { status: 404 });
  }

  const progress = await prisma.progress.findFirst({
    where: { userId: userId, status: "active" },
    orderBy: { startedAt: "desc" },
    select: { currentDay: true },
  });

  const day = progress?.currentDay ?? 1;
  const style = assessment.attachmentStyle as AttachmentStyle;
  const stageMap: Record<string, "early" | "processing" | "ready"> = {
    early: "early",
    processing: "processing",
    ready: "ready",
  };
  const stage = stageMap[assessment.recoveryReadiness ?? "early"] ?? "early";

  const quote = getDailyQuote(style, stage, day);
  const contentTasks = getDailyTasks(style, stage, day, 5);

  // Check for existing DB task rows for today
  // Replace the existing check with this:
const existingTasks = await prisma.dailyTask.findMany({
  where: {
    userId: userId,
    dayNumber: day,
  },
  orderBy: { createdAt: "asc" },
});

let dbTasks = existingTasks;

if (dbTasks.length === 0) {
  try {
    await prisma.dailyTask.createMany({
      data: contentTasks.map((t) => ({
        userId: userId,
        task: t.text,
        attachmentStyle: style,
        dayNumber: day,
        completed: false,
        date: new Date(),
      })),
    });
  } catch (err) {
    console.error("[content/daily] createMany failed:", err);
  }

  dbTasks = await prisma.dailyTask.findMany({
    where: { userId: userId, dayNumber: day },
    orderBy: { createdAt: "asc" },
  });
}

// Always take only 4
dbTasks = dbTasks.slice(0, 5);
  // Return DB shape with id and completion state
  const tasks = dbTasks.map((t) => ({
    id: t.id,
    text: t.task,
    completed: t.completed,
    attachmentStyle: t.attachmentStyle,
  }));

  return NextResponse.json({ quote, tasks, day });
}