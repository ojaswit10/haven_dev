// app/api/assessment/claim/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendAssessmentEmail } from "@/lib/sendAssessmentEmail";
import { calculateScores } from "@/lib/scoring";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assessmentId } = await req.json();
  if (!assessmentId) {
    return NextResponse.json({ error: "Missing assessmentId" }, { status: 400 });
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
  });

  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  if (assessment.userId && assessment.userId !== session.user.id) {
    return NextResponse.json({ error: "Assessment already claimed" }, { status: 403 });
  }

  const updated = await prisma.assessment.update({
    where: { id: assessmentId },
    data: { userId: session.user.id },
  });

  if (!assessment.emailSent) {
    await sendAssessmentEmail({
      to: session.user.email!,
      attachmentStyle: updated.attachmentStyle as "anxious" | "avoidant" | "secure" | "disorganized",
    });
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { emailSent: true },
    });
  }

  // Calculate scores from stored answers so results page has everything it needs
  const answers = updated.answers as Record<string, string>;
  const depthAnswers = {
    q13: answers["q13"] ?? "",
    q14: answers["q14"] ?? "",
    q15: answers["q15"] ?? "",
  };
  const scores = calculateScores(answers, depthAnswers);

  return NextResponse.json({ success: true, assessment: updated, scores });
}