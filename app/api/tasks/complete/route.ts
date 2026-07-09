// app/api/tasks/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { taskId, completed } = await req.json();

  if (!taskId) {
    return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
  }

  const task = await prisma.dailyTask.findUnique({
    where: { id: taskId },
    select: { userId: true, completed: true },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (task.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.dailyTask.update({
    where: { id: taskId },
    data: { completed },
  });

  // Increment tasksCompleted on Progress when checking off
  if (completed && !task.completed) {
    const assessment = await prisma.assessment.findFirst({
      where: { userId, status: "active" },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (assessment) {
      await prisma.progress.updateMany({
        where: { assessmentId: assessment.id },
        data: { tasksCompleted: { increment: 1 } },
      });
    }
  }

  // Decrement if unchecking
  if (!completed && task.completed) {
    const assessment = await prisma.assessment.findFirst({
      where: { userId, status: "active" },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (assessment) {
      await prisma.progress.updateMany({
        where: { assessmentId: assessment.id, tasksCompleted: { gt: 0 } },
        data: { tasksCompleted: { decrement: 1 } },
      });
    }
  }

  return NextResponse.json({ success: true, task: updated });
}