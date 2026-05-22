"use client";

import { useState } from "react";
import ComfortStep from "../shared/ComfortStep";
import SingleChoiceStep from "../shared/SingleChoiceStep";
import FeelingsStep from "../shared/FeelingsStep";
import AssessmentQuestionStep from "../shared/AssessmentQuestionStep";
import DepthQuestionStep from "../shared/DepthQuestionStep";
import StoryStep from "../shared/StoryStep";
import DoneStep from "../shared/DoneStep";
import { ASSESSMENT_QUESTIONS, DEPTH_QUESTIONS } from "@/lib/scoring";

type Step =
  | "comfort"
  | "gender"
  | "initiator"
  | "feelings"
  | "assessment"
  | "depth"
  | "story"
  | "done";

const TOTAL = ASSESSMENT_QUESTIONS.length + DEPTH_QUESTIONS.length;

export default function HeartbreakFlow() {
  const [step, setStep] = useState<Step>("comfort");
  const [assessmentIndex, setAssessmentIndex] = useState(0);
  const [depthIndex, setDepthIndex] = useState(0);

  const [gender, setGender] = useState("");
  const [initiator, setInitiator] = useState("");
  const [feelings, setFeelings] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [depthAnswers, setDepthAnswers] = useState<Record<string, string>>({});
  const [story, setStory] = useState("");

  const handleAssessmentAnswer = (val: string) => {
    const qId = ASSESSMENT_QUESTIONS[assessmentIndex].id;
    setAnswers((prev) => ({ ...prev, [qId]: val }));
    if (assessmentIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setAssessmentIndex((i) => i + 1);
    } else {
      setStep("depth");
    }
  };

  const handleDepthAnswer = (val: string) => {
    const qId = DEPTH_QUESTIONS[depthIndex].id;
    setDepthAnswers((prev) => ({ ...prev, [qId]: val }));
    if (depthIndex < DEPTH_QUESTIONS.length - 1) {
      setDepthIndex((i) => i + 1);
    } else {
      setStep("story");
    }
  };

  const handleStorySubmit = (storyText: string) => {
    setStory(storyText);
    setStep("done");
  };

  const handleSeeResults = async (email?: string) => {
    const mergedAnswers = { ...answers, ...depthAnswers };

    try {
      const res = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "heartbreak",
          gender,
          initiator,
          feelings,
          answers: mergedAnswers,
          story,
          email,
        }),
      });

      const data = await res.json();

      if (data.assessmentId) {
        localStorage.setItem("haven_assessment_id", data.assessmentId);
      }
    } catch (err) {
      console.error("Submission failed:", err);
    }

    // No redirect here — DoneStep handles its own confirmation screen
  };

  return (
    <>
      {step === "comfort" && (
        <ComfortStep
          message="I'm really sorry to hear that."
          subtext="Are you comfortable answering a few questions? They'll help me understand what you're going through."
          onContinue={() => setStep("gender")}
        />
      )}
      {step === "gender" && (
        <SingleChoiceStep
          question="What is your gender?"
          options={["Male", "Female", "Non-binary", "Prefer not to say"]}
          onSelect={(val) => { setGender(val); setStep("initiator"); }}
        />
      )}
      {step === "initiator" && (
        <SingleChoiceStep
          question="Who initiated the breakup?"
          options={["I did", "They did", "It was mutual", "It just faded away"]}
          onSelect={(val) => { setInitiator(val); setStep("feelings"); }}
        />
      )}
      {step === "feelings" && (
        <FeelingsStep
          onContinue={(f) => { setFeelings(f); setStep("assessment"); }}
        />
      )}
      {step === "assessment" && (
        <AssessmentQuestionStep
          currentQ={assessmentIndex + 1}
          total={TOTAL}
          question={ASSESSMENT_QUESTIONS[assessmentIndex].question}
          options={ASSESSMENT_QUESTIONS[assessmentIndex].options.map((o) => o.label)}
          onSelect={handleAssessmentAnswer}
        />
      )}
      {step === "depth" && (
        <DepthQuestionStep
          currentQ={ASSESSMENT_QUESTIONS.length + depthIndex + 1}
          total={TOTAL}
          question={DEPTH_QUESTIONS[depthIndex].question}
          onSelect={handleDepthAnswer}
        />
      )}
      {step === "story" && <StoryStep onSubmit={handleStorySubmit} />}
      {step === "done" && <DoneStep onSeeResults={handleSeeResults} />}
    </>
  );
}