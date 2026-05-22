// ─── Question Types ───────────────────────────────────────────────────────────

export interface Question {
  id: string;
  question: string;
  options: QuestionOption[];
  type: "single" | "depth";
}

export interface QuestionOption {
  label: string;
  scores: ScoreKeys;
}

export interface DepthQuestion {
  id: string;
  question: string;
  dimension: DepthDimension;
}

interface ScoreKeys {
  anxious?: number;
  avoidant?: number;
  secure?: number;
  disorganized?: number;
  rumination?: number;
  rejectionSensitivity?: number;
  selfWorthImpact?: number;
  relationshipPattern?: number;
}

type DepthDimension =
  | "rejectionSensitivity"
  | "blameIndex"
  | "recoveryReadiness";

// ─── Assessment Questions (Q1–Q12) ───────────────────────────────────────────

export const ASSESSMENT_QUESTIONS: Question[] = [
  {
    id: "q1",
    question: "When they didn't reply for a while, what did you usually do?",
    type: "single",
    options: [
      {
        label: "Waited patiently, they'd reply eventually",
        scores: { secure: 2 },
      },
      {
        label: "Checked my phone more than I'd like to admit",
        scores: { anxious: 2, rumination: 2 },
      },
      {
        label: "Assumed something was wrong and reached out",
        scores: { anxious: 2, disorganized: 1, rejectionSensitivity: 1 },
      },
      {
        label: "Got frustrated but kept it to myself",
        scores: { avoidant: 2 },
      },
    ],
  },
  {
    id: "q2",
    question:
      "How often did you need reassurance that things were okay between you two?",
    type: "single",
    options: [
      { label: "Rarely, I trusted us", scores: { secure: 2 } },
      {
        label: "Sometimes, when things felt off",
        scores: { secure: 1, anxious: 1 },
      },
      {
        label: "Often, I always needed to know we were good",
        scores: { anxious: 2, rejectionSensitivity: 2 },
      },
      { label: "Never really thought about it", scores: { avoidant: 2 } },
    ],
  },
  {
    id: "q3",
    question: "When you had a fight, what was your instinct?",
    type: "single",
    options: [
      { label: "Talk it out immediately", scores: { secure: 2 } },
      {
        label: "Pull away and needed time alone",
        scores: { avoidant: 2 },
      },
      {
        label: "Panicked and wanted to fix it right away",
        scores: { anxious: 2, rejectionSensitivity: 1 },
      },
      {
        label: "Shut down completely",
        scores: { disorganized: 2 },
      },
    ],
  },
  {
    id: "q4",
    question:
      "Did you find yourself changing your behavior to keep them happy?",
    type: "single",
    options: [
      {
        label: "Yes, more than I should have",
        scores: { anxious: 2, selfWorthImpact: 2 },
      },
      {
        label: "Sometimes, but within reason",
        scores: { secure: 1, anxious: 1 },
      },
      {
        label: "No, I was always myself",
        scores: { secure: 2, avoidant: 1 },
      },
      {
        label: "I tried to but it never felt enough",
        scores: { disorganized: 2, selfWorthImpact: 2 },
      },
    ],
  },
  {
    id: "q5",
    question:
      "How did you feel when they spent time with others instead of you?",
    type: "single",
    options: [
      {
        label: "Fine, everyone needs their space",
        scores: { secure: 2, avoidant: 1 },
      },
      {
        label: "A little lonely but it was okay",
        scores: { secure: 1 },
      },
      {
        label: "Anxious, I wondered if I mattered less",
        scores: { anxious: 2, rejectionSensitivity: 2 },
      },
      {
        label: "Honestly, kind of relieved sometimes",
        scores: { avoidant: 2 },
      },
    ],
  },
  {
    id: "q6",
    question:
      "Does this kind of pain feel familiar — like you've been here before?",
    type: "single",
    options: [
      {
        label: "Yes, this happens to me in relationships",
        scores: { relationshipPattern: 3, anxious: 1 },
      },
      {
        label: "It feels similar to past situations",
        scores: { relationshipPattern: 2 },
      },
      {
        label: "No, this is unlike anything I've felt before",
        scores: { relationshipPattern: 0, secure: 1 },
      },
      {
        label: "I'm not sure, I haven't reflected on it",
        scores: { disorganized: 1 },
      },
    ],
  },
  {
    id: "q7",
    question:
      "How much time do you spend thinking about them or the relationship each day?",
    type: "single",
    options: [
      {
        label: "Barely at all, I can distract myself",
        scores: { secure: 2, rumination: 0 },
      },
      {
        label: "A few times, it comes and goes",
        scores: { secure: 1, rumination: 1 },
      },
      {
        label: "Most of the day, it's hard to focus",
        scores: { anxious: 1, rumination: 2 },
      },
      {
        label: "Almost constantly, I can't stop",
        scores: { anxious: 2, rumination: 3, rejectionSensitivity: 1 },
      },
    ],
  },
  {
    id: "q8",
    question: "Did you ever feel like you loved them more than they loved you?",
    type: "single",
    options: [
      {
        label: "Yes, almost always",
        scores: { anxious: 2, selfWorthImpact: 2 },
      },
      {
        label: "Sometimes it crossed my mind",
        scores: { anxious: 1, secure: 1 },
      },
      { label: "No, it felt equal", scores: { secure: 2 } },
      {
        label: "I pulled back so I wouldn't have to find out",
        scores: { avoidant: 2, disorganized: 1 },
      },
    ],
  },
  {
    id: "q9",
    question:
      "When the relationship was good, did you still worry it wouldn't last?",
    type: "single",
    options: [
      {
        label: "Yes, constantly",
        scores: { anxious: 2, rejectionSensitivity: 2 },
      },
      {
        label: "Occasionally when things were too good",
        scores: { anxious: 1, disorganized: 1 },
      },
      { label: "Not really, I enjoyed it", scores: { secure: 2 } },
      {
        label: "I always kept one foot out the door just in case",
        scores: { avoidant: 2 },
      },
    ],
  },
  {
    id: "q10",
    question: "How do you feel about them right now?",
    type: "single",
    options: [
      {
        label: "I miss them terribly and want them back",
        scores: { anxious: 2, rumination: 2 },
      },
      {
        label: "I'm angry and I can't stop thinking about it",
        scores: { anxious: 1, disorganized: 1, rumination: 2 },
      },
      {
        label: "I'm hurt but I know it's over",
        scores: { secure: 2 },
      },
      {
        label: "Numb, I don't know what I feel",
        scores: { disorganized: 2 },
      },
    ],
  },
  {
    id: "q11",
    question: "Have you reached out to them since the breakup?",
    type: "single",
    options: [
      {
        label: "Yes, multiple times",
        scores: { anxious: 2, rumination: 2, rejectionSensitivity: 1 },
      },
      {
        label: "Once or twice",
        scores: { anxious: 1, secure: 1 },
      },
      {
        label: "No, but I've wanted to",
        scores: { anxious: 1, avoidant: 1, rumination: 1 },
      },
      {
        label: "No and I don't plan to",
        scores: { avoidant: 2 },
      },
    ],
  },
  {
    id: "q12",
    question: "What do you think caused the relationship to end?",
    type: "single",
    options: [
      {
        label: "Something they did",
        scores: { anxious: 1, disorganized: 1 },
      },
      {
        label: "Something I did",
        scores: { secure: 1, anxious: 1, selfWorthImpact: 1 },
      },
      {
        label: "We just weren't right for each other",
        scores: { secure: 2 },
      },
      {
        label: "I'm still trying to figure that out",
        scores: { disorganized: 2, rumination: 1 },
      },
    ],
  },
];

// ─── Depth Questions (Q13–Q15) ────────────────────────────────────────────────

export const DEPTH_QUESTIONS: DepthQuestion[] = [
  {
    id: "q13",
    question:
      "Do you think you would suffer in their absence while they move on easily?",
    dimension: "rejectionSensitivity",
  },
  {
    id: "q14",
    question: "Do you blame yourself for the situation you're in right now?",
    dimension: "blameIndex",
  },
  {
    id: "q15",
    question:
      "Do you think you can ever move on from this and love anyone again?",
    dimension: "recoveryReadiness",
  },
];

export const DEPTH_OPTIONS = [
  "Not at all",
  "Slightly",
  "Strongly",
  "Completely",
];

// ─── Scoring Types ────────────────────────────────────────────────────────────

export interface ScoringResult {
  // Attachment style
  anxiousScore: number;
  avoidantScore: number;
  secureScore: number;
  disorganizedScore: number;
  attachmentStyle: "anxious" | "avoidant" | "secure" | "disorganized";

  // Emotional dimensions
  emotionalDepthScore: number; // 0-9
  blameIndex: "high" | "low";
  rejectionSensitivity: "high" | "medium" | "low";
  ruminationLevel: "high" | "medium" | "low";
  selfWorthImpact: "high" | "medium" | "low";
  recoveryReadiness: "early" | "processing" | "ready";
  relationshipPattern: "repeating" | "situational";

  // Percentages for email graph
  anxiousPercent: number;
  avoidantPercent: number;
  securePercent: number;
  disorganizedPercent: number;
}

// ─── Scoring Function ─────────────────────────────────────────────────────────

export function calculateScores(
  answers: Record<string, string>,
  depthAnswers: Record<string, string>
): ScoringResult {
  // Raw score accumulators
  let anxious = 0;
  let avoidant = 0;
  let secure = 0;
  let disorganized = 0;
  let rumination = 0;
  let rejectionSensitivity = 0;
  let selfWorthImpact = 0;
  let relationshipPatternScore = 0;

  // Score each assessment answer
  ASSESSMENT_QUESTIONS.forEach((q) => {
    const selectedLabel = answers[q.id];
    if (!selectedLabel) return;

    const option = q.options.find((o) => o.label === selectedLabel);
    if (!option) return;

    const s = option.scores;
    if (s.anxious) anxious += s.anxious;
    if (s.avoidant) avoidant += s.avoidant;
    if (s.secure) secure += s.secure;
    if (s.disorganized) disorganized += s.disorganized;
    if (s.rumination) rumination += s.rumination;
    if (s.rejectionSensitivity) rejectionSensitivity += s.rejectionSensitivity;
    if (s.selfWorthImpact) selfWorthImpact += s.selfWorthImpact;
    if (s.relationshipPattern) relationshipPatternScore += s.relationshipPattern;
  });

  // ── Depth answers scoring ────────────────────────────────────────────────

  const depthScale: Record<string, number> = {
    "Not at all": 0,
    Slightly: 1,
    Strongly: 2,
    Completely: 3,
  };

  const q13Score = depthScale[depthAnswers["q13"]] ?? 0; // rejection sensitivity
  const q14Score = depthScale[depthAnswers["q14"]] ?? 0; // blame index
  const q15Score = depthScale[depthAnswers["q15"]] ?? 0; // recovery readiness

  // Add depth to rejection sensitivity
  rejectionSensitivity += q13Score;

  // Emotional depth score — sum of all three depth answers (0-9)
  const emotionalDepthScore = q13Score + q14Score + q15Score;

  // ── Attachment style ─────────────────────────────────────────────────────

  const styleScores = { anxious, avoidant, secure, disorganized };
  const attachmentStyle = (
    Object.entries(styleScores).sort((a, b) => b[1] - a[1])[0][0]
  ) as ScoringResult["attachmentStyle"];

  // ── Percentages for graph ────────────────────────────────────────────────

  const total = anxious + avoidant + secure + disorganized || 1;
  const anxiousPercent = Math.round((anxious / total) * 100);
  const avoidantPercent = Math.round((avoidant / total) * 100);
  const securePercent = Math.round((secure / total) * 100);
  const disorganizedPercent = Math.round((disorganized / total) * 100);

  // ── Dimensional thresholds ───────────────────────────────────────────────

  // Rumination level (max possible ~12)
  const ruminationLevel: ScoringResult["ruminationLevel"] =
    rumination >= 7 ? "high" : rumination >= 4 ? "medium" : "low";

  // Rejection sensitivity (max possible ~12)
  const rejectionSensitivityLevel: ScoringResult["rejectionSensitivity"] =
    rejectionSensitivity >= 7
      ? "high"
      : rejectionSensitivity >= 4
      ? "medium"
      : "low";

  // Self worth impact (max possible ~8)
  const selfWorthImpactLevel: ScoringResult["selfWorthImpact"] =
    selfWorthImpact >= 5 ? "high" : selfWorthImpact >= 3 ? "medium" : "low";

  // Blame index — high if q14 score >= 2
  const blameIndex: ScoringResult["blameIndex"] =
    q14Score >= 2 ? "high" : "low";

  // Recovery readiness based on q15
  // "Not at all" (0) → early, "Slightly" (1) → early, "Strongly" (2) → processing, "Completely" (3) → ready
  const recoveryReadiness: ScoringResult["recoveryReadiness"] =
    q15Score >= 3 ? "ready" : q15Score >= 2 ? "processing" : "early";

  // Relationship pattern — repeating if score >= 2
  const relationshipPattern: ScoringResult["relationshipPattern"] =
    relationshipPatternScore >= 2 ? "repeating" : "situational";

  return {
    anxiousScore: anxious,
    avoidantScore: avoidant,
    secureScore: secure,
    disorganizedScore: disorganized,
    attachmentStyle,
    emotionalDepthScore,
    blameIndex,
    rejectionSensitivity: rejectionSensitivityLevel,
    ruminationLevel,
    selfWorthImpact: selfWorthImpactLevel,
    recoveryReadiness,
    relationshipPattern,
    anxiousPercent,
    avoidantPercent,
    securePercent,
    disorganizedPercent,
  };
}

// ─── Human readable labels ────────────────────────────────────────────────────

export function getAttachmentLabel(style: ScoringResult["attachmentStyle"]) {
  const labels = {
    anxious: "Anxious Attachment",
    avoidant: "Avoidant Attachment",
    secure: "Secure Attachment",
    disorganized: "Disorganized Attachment",
  };
  return labels[style];
}