// app/api/assessment/latest/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateScores } from "@/lib/scoring";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ assessment: null });
  }

  const assessment = await prisma.assessment.findFirst({
    where: { userId: session.user.id, status: "active" },
    orderBy: { createdAt: "desc" },
  });

  if (!assessment) {
    return NextResponse.json({ assessment: null });
  }

  const answers = assessment.answers as Record<string, string>;

  const depthAnswers: Record<string, string> = {
    q13: answers["q13"] ?? "",
    q14: answers["q14"] ?? "",
    q15: answers["q15"] ?? "",
  };

  const scores = calculateScores(answers, depthAnswers);

  return NextResponse.json({ assessment, scores });
}