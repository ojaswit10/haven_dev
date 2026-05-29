// app/api/assessment/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateScores } from "@/lib/scoring";
import { sendAssessmentEmail } from "@/lib/sendAssessmentEmail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, gender, initiator, feelings, answers, story, email } = body;

    if (!category || !answers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const depthAnswers: Record<string, string> = {
      q13: answers["q13"] ?? "",
      q14: answers["q14"] ?? "",
      q15: answers["q15"] ?? "",
    };

    const scores = calculateScores(answers, depthAnswers);

    const assessment = await prisma.assessment.create({
      data: {
        userId: null,           // anonymous — claim route links it later
        category,
        gender: gender ?? "prefer_not_to_say",
        initiator: initiator ?? "faded_away",
        feelings: feelings ?? [],
        answers,
        attachmentStyle: scores.attachmentStyle,
        anxiousScore: scores.anxiousScore,
        avoidantScore: scores.avoidantScore,
        secureScore: scores.secureScore,
        disorganizedScore: scores.disorganizedScore,
        emotionalDepthScore: scores.emotionalDepthScore,
        blameIndex: scores.blameIndex,
        story: story ?? "",
        status: "active",
        emailSent: false,
        recoveryReadiness: scores.recoveryReadiness,
      },
    });

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

if (email && isValidEmail(email)) {
  await sendAssessmentEmail({ to: email.trim(), attachmentStyle: scores.attachmentStyle });
  await prisma.assessment.update({
    where: { id: assessment.id },
    data: { emailSent: true },
  });
}

    return NextResponse.json({ success: true, assessmentId: assessment.id, scores });

  } catch (err) {
    console.error("[assessment/submit]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}