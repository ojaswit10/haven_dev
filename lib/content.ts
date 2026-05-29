// lib/content.ts
// Haven curated content dataset — quotes and tasks

// ─── Types ────────────────────────────────────────────────────────────────────

export type Stage = "early" | "processing" | "ready" | "universal";
export type AttachmentStyle = "anxious" | "avoidant" | "secure" | "disorganized";

export interface Quote {
  text: string;
  author: string;
  stage: Stage;
  category: string;
}

export interface Task {
  text: string;
  style: AttachmentStyle[];  // which styles this task applies to
  stage: Stage[];            // which stages this task applies to
  category: string;
}

// ─── Quotes ───────────────────────────────────────────────────────────────────

export const QUOTES: Quote[] = [
  // ── Early ──────────────────────────────────────────────────────────────────
  { text: "Some people leave quietly but echo inside you for months.", author: "Haven", stage: "early", category: "heartbreak" },
  { text: "Grief is just love with nowhere to go.", author: "Jamie Anderson", stage: "early", category: "heartbreak" },
  { text: "It hurts because it mattered.", author: "John Green", stage: "early", category: "heartbreak" },
  { text: "You are not hard to love. You were simply loved poorly.", author: "Haven", stage: "early", category: "heartbreak" },
  { text: "The hardest goodbye is the one you never got to say properly.", author: "Haven", stage: "early", category: "heartbreak" },
  { text: "Some chapters feel like drowning before they become wisdom.", author: "Haven", stage: "early", category: "heartbreak" },
  { text: "It is okay if all you did today was survive.", author: "Haven", stage: "early", category: "heartbreak" },
  { text: "You will not always feel this heavy.", author: "Haven", stage: "early", category: "heartbreak" },
  { text: "You cannot force someone to choose you.", author: "Haven", stage: "early", category: "heartbreak" },
  { text: "Your heart is tired, not broken beyond repair.", author: "Haven", stage: "early", category: "heartbreak" },
  { text: "Some mornings survival is the bravest thing you can do.", author: "Haven", stage: "early", category: "heartbreak" },
  { text: "Do not rush yourself into pretending you are okay.", author: "Haven", stage: "early", category: "heartbreak" },
  { text: "Some pain leaves slowly because the love was real.", author: "Haven", stage: "early", category: "heartbreak" },
  { text: "You are not failing because you still think about them.", author: "Haven", stage: "early", category: "heartbreak" },
  { text: "Sometimes your heart needs more time to accept what your mind already knows.", author: "Paulo Coelho", stage: "early", category: "heartbreak" },
  { text: "Your heart will trust again when it is ready.", author: "Haven", stage: "early", category: "heartbreak" },
  { text: "You loved deeply. That is never something to be ashamed of.", author: "Haven", stage: "early", category: "heartbreak" },
  { text: "The absence of someone can teach you the value of your own presence.", author: "Haven", stage: "early", category: "heartbreak" },
  { text: "You are still worthy of love on your hardest days.", author: "Haven", stage: "early", category: "heartbreak" },
  { text: "There is nothing weak about needing time.", author: "Haven", stage: "early", category: "heartbreak" },

  // ── Processing ─────────────────────────────────────────────────────────────
  { text: "Healing starts the moment you stop begging for what broke you.", author: "Haven", stage: "processing", category: "heartbreak" },
  { text: "You miss the feeling, not always the person.", author: "Haven", stage: "processing", category: "heartbreak" },
  { text: "Closure is not always a conversation. Sometimes it is a decision.", author: "Haven", stage: "processing", category: "heartbreak" },
  { text: "The wound is the place where the light enters you.", author: "Rumi", stage: "processing", category: "heartbreak" },
  { text: "Do not confuse familiar pain with real love.", author: "Haven", stage: "processing", category: "heartbreak" },
  { text: "You are allowed to outgrow people you once begged to stay.", author: "Haven", stage: "processing", category: "heartbreak" },
  { text: "There are people who leave and people who awaken you by leaving.", author: "Haven", stage: "processing", category: "heartbreak" },
  { text: "Missing them does not mean you made the wrong choice.", author: "Haven", stage: "processing", category: "heartbreak" },
  { text: "Not every ending is meant to be understood immediately.", author: "Haven", stage: "processing", category: "heartbreak" },
  { text: "Every heartbreak teaches the heart a new language.", author: "Haven", stage: "processing", category: "heartbreak" },
  { text: "Some people are lessons disguised as soulmates.", author: "Haven", stage: "processing", category: "heartbreak" },
  { text: "Peace often arrives after acceptance, not answers.", author: "Haven", stage: "processing", category: "heartbreak" },
  { text: "Healing is remembering who you were before the pain convinced you otherwise.", author: "Haven", stage: "processing", category: "heartbreak" },
  { text: "You are learning how to let go without losing yourself.", author: "Haven", stage: "processing", category: "heartbreak" },
  { text: "Not all love stories are meant to last forever to matter forever.", author: "Haven", stage: "processing", category: "heartbreak" },
  { text: "Sometimes clarity comes after the silence.", author: "Haven", stage: "processing", category: "heartbreak" },
  { text: "You do not need to hate them to heal from them.", author: "Haven", stage: "processing", category: "heartbreak" },
  { text: "Love should not feel like begging for reassurance.", author: "Haven", stage: "processing", category: "heartbreak" },
  { text: "The love you gave was real even if they could not hold it.", author: "Haven", stage: "processing", category: "heartbreak" },
  { text: "Your healing deserves patience, not pressure.", author: "Haven", stage: "processing", category: "heartbreak" },

  // ── Ready ──────────────────────────────────────────────────────────────────
  { text: "You survived every version of yourself before this one too.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "One day, your peace will matter more than their return.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "Sometimes losing them is how you find yourself again.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "You cannot heal in the same place that keeps hurting you.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "You can miss someone deeply and still choose yourself.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "The right people will never make you question your worth every day.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "The version of you after this will know how to love better.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "Do not abandon yourself trying to hold onto someone else.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "The people meant for you will not require you to shrink.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "Every ending carries the seed of a beginning.", author: "Rumi", stage: "ready", category: "heartbreak" },
  { text: "There is life waiting for you beyond this sadness.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "One day this pain will feel like a distant season.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "Your value does not decrease because someone failed to see it.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "What broke you is not the end of you.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "You are becoming someone your younger self would feel safe with.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "There is courage in choosing not to go back.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "You are not too much. You were asking the wrong person.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "You are allowed to protect your peace now.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "The right love will feel safe, not exhausting.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "You survived losing someone you thought you could not live without.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "Your tenderness will one day be appreciated properly.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "Not everyone you lose is a loss.", author: "C.S. Lewis", stage: "ready", category: "heartbreak" },
  { text: "You are learning how to choose yourself without guilt.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "Sometimes healing is simply refusing to reopen the door.", author: "Haven", stage: "ready", category: "heartbreak" },
  { text: "You deserve consistency, not confusion.", author: "Haven", stage: "ready", category: "heartbreak" },

  // ── Universal ──────────────────────────────────────────────────────────────
  { text: "The heart heals in layers, not all at once.", author: "Haven", stage: "universal", category: "heartbreak" },
  { text: "Feel everything. Just do not unpack and live there forever.", author: "Haven", stage: "universal", category: "heartbreak" },
  { text: "You are becoming someone stronger through this pain.", author: "Haven", stage: "universal", category: "heartbreak" },
  { text: "You are not behind in healing.", author: "Haven", stage: "universal", category: "heartbreak" },
  { text: "Your softness is not weakness.", author: "Haven", stage: "universal", category: "heartbreak" },
  { text: "You are still worthy of love on your hardest days.", author: "Haven", stage: "universal", category: "heartbreak" },
  { text: "You loved deeply. That is never something to be ashamed of.", author: "Haven", stage: "universal", category: "heartbreak" },
  { text: "The heart remembers, but it also recovers.", author: "Haven", stage: "universal", category: "heartbreak" },
  { text: "You are allowed to heal at your own pace.", author: "Haven", stage: "universal", category: "heartbreak" },
  { text: "You can begin again as many times as necessary.", author: "Haven", stage: "universal", category: "heartbreak" },
  { text: "The heart expands through both love and loss.", author: "Haven", stage: "universal", category: "heartbreak" },
  { text: "The soul knows how to rebuild itself quietly.", author: "Haven", stage: "universal", category: "heartbreak" },
  { text: "Even storms run out of rain eventually.", author: "Maya Angelou", stage: "universal", category: "heartbreak" },
  { text: "You are still growing through what you are grieving.", author: "Haven", stage: "universal", category: "heartbreak" },
  { text: "This version of your life is temporary too.", author: "Haven", stage: "universal", category: "heartbreak" },
  { text: "There is nothing weak about needing time.", author: "Haven", stage: "universal", category: "heartbreak" },
  { text: "Sometimes the heart needs distance to hear itself again.", author: "Haven", stage: "universal", category: "heartbreak" },
  { text: "Your healing deserves patience, not pressure.", author: "Haven", stage: "universal", category: "heartbreak" },
  { text: "You do not owe anyone access to your healing.", author: "Haven", stage: "universal", category: "heartbreak" },
  { text: "You are allowed to be both a masterpiece and a work in progress.", author: "Haven", stage: "universal", category: "heartbreak" },
];

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const TASKS: Task[] = [
  // ── Anxious ────────────────────────────────────────────────────────────────
  { text: "Don't check their profile today. Just today.", style: ["anxious"], stage: ["early", "processing"], category: "heartbreak" },
  { text: "Write down one thing you like about yourself — unrelated to any relationship.", style: ["anxious"], stage: ["early", "processing", "ready"], category: "heartbreak" },
  { text: "Go one hour without checking your phone. Notice how it feels.", style: ["anxious"], stage: ["early"], category: "heartbreak" },
  { text: "Write a letter to your past self. You don't have to send it.", style: ["anxious"], stage: ["processing"], category: "heartbreak" },
  { text: "Name three things you're grateful for right now. Small ones count.", style: ["anxious"], stage: ["early", "processing"], category: "heartbreak" },
  { text: "Notice once today when you seek reassurance — and pause before acting on it.", style: ["anxious"], stage: ["early", "processing"], category: "heartbreak" },
  { text: "Write down what you needed from them that you didn't get.", style: ["anxious"], stage: ["processing"], category: "heartbreak" },
  { text: "Spend 10 minutes doing something you loved before this relationship.", style: ["anxious"], stage: ["processing", "ready"], category: "heartbreak" },

  // ── Avoidant ───────────────────────────────────────────────────────────────
  { text: "Tell one person something real about how you're feeling today.", style: ["avoidant"], stage: ["early", "processing"], category: "heartbreak" },
  { text: "Sit with a feeling for five minutes without distracting yourself.", style: ["avoidant"], stage: ["early", "processing"], category: "heartbreak" },
  { text: "Text someone you care about first — don't wait for them to reach out.", style: ["avoidant"], stage: ["processing", "ready"], category: "heartbreak" },
  { text: "Write about what you actually want from a relationship. Be honest.", style: ["avoidant"], stage: ["processing"], category: "heartbreak" },
  { text: "Do something kind for yourself that isn't productivity.", style: ["avoidant"], stage: ["early", "processing", "ready"], category: "heartbreak" },
  { text: "Let yourself listen to a song that makes you feel something.", style: ["avoidant"], stage: ["early", "processing"], category: "heartbreak" },
  { text: "Acknowledge one emotion today without immediately trying to fix it.", style: ["avoidant"], stage: ["early"], category: "heartbreak" },
  { text: "Write honestly about what you're avoiding right now.", style: ["avoidant"], stage: ["processing"], category: "heartbreak" },

  // ── Secure ─────────────────────────────────────────────────────────────────
  { text: "Journal about one thing this relationship taught you.", style: ["secure"], stage: ["processing", "ready"], category: "heartbreak" },
  { text: "Call or text someone who makes you feel safe.", style: ["secure"], stage: ["early", "processing"], category: "heartbreak" },
  { text: "Do one thing today that is entirely for you.", style: ["secure"], stage: ["processing", "ready"], category: "heartbreak" },
  { text: "Write about what you're looking forward to — however small.", style: ["secure"], stage: ["ready"], category: "heartbreak" },
  { text: "Acknowledge one way you've grown through this.", style: ["secure"], stage: ["processing", "ready"], category: "heartbreak" },
  { text: "Share how you're actually doing with someone you trust.", style: ["secure"], stage: ["early", "processing"], category: "heartbreak" },
  { text: "Spend 10 minutes doing something creative — no pressure, just play.", style: ["secure"], stage: ["processing", "ready"], category: "heartbreak" },

  // ── Disorganized ───────────────────────────────────────────────────────────
  { text: "Ground yourself: name 5 things you can see right now.", style: ["disorganized"], stage: ["early", "processing"], category: "heartbreak" },
  { text: "Write whatever comes — no structure, no editing, no judgement.", style: ["disorganized"], stage: ["early", "processing"], category: "heartbreak" },
  { text: "Reach out to one person who feels consistent and safe.", style: ["disorganized"], stage: ["early", "processing"], category: "heartbreak" },
  { text: "Take a slow walk without your phone.", style: ["disorganized"], stage: ["early", "processing", "ready"], category: "heartbreak" },
  { text: "Write about a moment you felt truly at peace. What made it that way?", style: ["disorganized"], stage: ["processing", "ready"], category: "heartbreak" },
  { text: "Breathe slowly for two minutes before starting your day.", style: ["disorganized"], stage: ["early"], category: "heartbreak" },
  { text: "Do one small thing today that makes you feel in control.", style: ["disorganized"], stage: ["early", "processing"], category: "heartbreak" },

  // ── Universal tasks (all styles) ───────────────────────────────────────────
  { text: "Reach out to a friend you haven't spoken to this week.", style: ["anxious", "avoidant", "secure", "disorganized"], stage: ["processing", "ready"], category: "heartbreak" },
  { text: "Write down three things that are going right — however small.", style: ["anxious", "avoidant", "secure", "disorganized"], stage: ["processing", "ready"], category: "heartbreak" },
  { text: "Cook or make yourself something you enjoy eating.", style: ["anxious", "avoidant", "secure", "disorganized"], stage: ["early", "processing"], category: "heartbreak" },
  { text: "Step outside for at least 10 minutes today.", style: ["anxious", "avoidant", "secure", "disorganized"], stage: ["early", "processing", "ready"], category: "heartbreak" },
  { text: "Put your phone in another room for one hour.", style: ["anxious", "avoidant", "secure", "disorganized"], stage: ["early", "processing"], category: "heartbreak" },
];

// ─── Selector functions ───────────────────────────────────────────────────────

export function getDailyQuote(
  style: AttachmentStyle,
  recoveryReadiness: "early" | "processing" | "ready",
  day: number
): Quote {
  // Weight toward stage-matching quotes, but include universal
  const matching = QUOTES.filter(
    (q) => q.stage === recoveryReadiness || q.stage === "universal"
  );

  // Use day as deterministic seed so same user sees same quote all day
  const seed = day % matching.length;
  return matching[seed];
}

export function getDailyTasks(
  style: AttachmentStyle,
  recoveryReadiness: "early" | "processing" | "ready",
  day: number,
  count = 4
): Task[] {
  // Get tasks matching this style and stage
  const matching = TASKS.filter(
    (t) =>
      t.style.includes(style) &&
      (t.stage.includes(recoveryReadiness) || t.stage.includes("universal" as Stage))
  );

  // Fallback to all tasks if not enough
  const pool = matching.length >= count ? matching : TASKS;

  // Deterministic shuffle using day as seed
  const shuffled = [...pool].sort((a, b) => {
    const hashA = (a.text.charCodeAt(0) + day) % pool.length;
    const hashB = (b.text.charCodeAt(0) + day) % pool.length;
    return hashA - hashB;
  });

  return shuffled.slice(0, count);
}