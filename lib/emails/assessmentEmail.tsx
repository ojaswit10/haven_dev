interface AssessmentEmailProps {
    attachmentStyle: string;
    attachmentDescription: string;
    onePattern: {
        emoji: string;
        title: string;
        description: string;
    };
    scienceParagraph?: string;
}

export function generateAssessmentEmail({
    attachmentStyle,
    attachmentDescription,
    onePattern,
    scienceParagraph,
}: AssessmentEmailProps): string {
    const science =
        scienceParagraph ||
        "Heartbreak isn't only emotional — it's neurological. The same brain regions that process physical pain light up when we lose someone we love. That's why your chest aches, why sleep feels strange, why their name on a screen can stop your breath. You're not being dramatic. Your brain is healing a real wound.";

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Your haven reflection</title>
<style>
  body { margin: 0; padding: 0; background-color: #F4EEE5; font-family: Helvetica, Arial, sans-serif; color: #2D3748; -webkit-font-smoothing: antialiased; }
  table { border-collapse: collapse; }
  a { color: #7BA7C2; text-decoration: none; }
  .wrapper { width: 100%; background-color: #F4EEE5; padding: 32px 0; }
  .container { width: 600px; max-width: 100%; margin: 0 auto; }
  .card { background: #FDF8F2; border-radius: 24px; padding: 32px; margin-bottom: 16px; }
  h1, h2, h3 { font-family: Georgia, "Times New Roman", serif; color: #2D3748; font-weight: 600; margin: 0; }
  p { font-size: 15px; line-height: 1.7; color: #2D3748; margin: 0 0 12px; }
  .muted { color: #8A8578; font-size: 13px; line-height: 1.6; }
  .uppercase-label { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #C4A882; font-weight: 700; }
  .pill { display: inline-block; padding: 14px 32px; border-radius: 50px; background: #A8C5DA; color: #FDF8F2; font-weight: 600; font-size: 15px; text-decoration: none; }
  .accent-card { border-left: 4px solid #A8C5DA; border-radius: 0 16px 16px 0; background: #F8F1E5; padding: 22px 24px; }
  .pattern-card { background: #F8F1E5; border-radius: 16px; padding: 16px 18px; }
  .blurred { color: #C9C2B5; filter: blur(4px); user-select: none; font-size: 14px; line-height: 1.7; margin-bottom: 18px; pointer-events: none; }
  .locked-inner { background: #F8F1E5; border-radius: 16px; padding: 24px; text-align: center; }
  .citation { font-size: 12px; color: #A89F8E; font-style: italic; line-height: 1.5; margin: 4px 0; }
  @media only screen and (max-width: 620px) {
    .container { width: 100% !important; padding: 0 16px !important; box-sizing: border-box; }
    .card { padding: 22px !important; border-radius: 18px !important; }
  }
</style>
</head>
<body>
<table role="presentation" class="wrapper" width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center">
<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0">

  <!-- HEADER -->
  <tr><td style="padding: 16px 0 28px; text-align: center;">
    <div style="font-family: Georgia, serif; font-size: 32px; color: #2D3748; font-weight: 600;">haven</div>
    <div style="width: 36px; height: 2px; background: #A8C5DA; margin: 10px auto;"></div>
    <div style="font-family: Georgia, serif; font-style: italic; color: #8A8578; font-size: 14px;">your personal reflection</div>
  </td></tr>

  <!-- OPENING -->
  <tr><td>
    <div class="card">
      <h2 style="font-size: 22px; margin-bottom: 14px;">We've been thinking about what you shared.</h2>
      <p>What follows isn't a diagnosis or a label. Think of it as a mirror — a gentle reflection of patterns we noticed, offered with care. Take what feels true. Leave what doesn't.</p>
      <p class="muted" style="margin-bottom: 0;">Read slowly. There's no rush.</p>
    </div>
  </td></tr>

  <!-- ATTACHMENT STYLE -->
  <tr><td style="padding-top: 4px;">
    <div class="card">
      <div class="accent-card">
        <div class="uppercase-label" style="margin-bottom: 12px;">YOUR ATTACHMENT STYLE</div>
        <h1 style="font-size: 30px; margin-bottom: 14px;">${attachmentStyle}</h1>
        <p style="margin-bottom: 10px;">${attachmentDescription}</p>
        <p class="citation" style="margin-top: 14px;">Based on attachment theory research (Bowlby, 1969; Ainsworth, 1978).</p>
      </div>
    </div>
  </td></tr>

  <!-- THE SCIENCE -->
  <tr><td style="padding-top: 4px;">
    <div class="card">
      <h3 style="font-size: 20px; margin-bottom: 14px;">The science, softly</h3>
      <p>${science}</p>
      <p class="citation">Kross et al., PNAS (2011) — Social rejection shares somatosensory representations with physical pain.</p>
      <p class="citation" style="margin-bottom: 0;">Fisher et al., J. Neurophysiology (2010) — Reward systems and romantic rejection.</p>
    </div>
  </td></tr>

  <!-- ONE BEHAVIORAL PATTERN -->
  <tr><td style="padding-top: 4px;">
    <div class="card">
      <h3 style="font-size: 20px; margin-bottom: 6px;">This might sound familiar</h3>
      <p class="muted" style="margin-bottom: 16px;">One pattern we noticed in what you shared.</p>
      <div class="pattern-card">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="40" valign="top" style="font-size: 22px;">${onePattern.emoji}</td>
          <td>
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 5px;">${onePattern.title}</div>
            <div class="muted" style="font-size: 13px;">${onePattern.description}</div>
          </td>
        </tr></table>
      </div>
    </div>
  </td></tr>

  <!-- LOCKED SECTION -->
  <tr><td style="padding-top: 4px;">
    <div class="card">
      <div class="uppercase-label" style="margin-bottom: 10px; text-align: center;">YOUR FULL REFLECTION</div>
      <h3 style="font-size: 20px; text-align: center; margin-bottom: 18px;">There's more we'd like to share with you</h3>
      <div class="locked-inner">
        <div class="blurred">
          Your score breakdown across all attachment styles · two more patterns we noticed · your emotional triggers · gentle do's and don'ts for your attachment type · a 14-day recovery path written just for you · the questions worth sitting with.
        </div>
        <a href="${process.env.NEXTAUTH_URL}/results" class="pill">Unlock your full analysis</a>
        <div class="muted" style="margin-top: 14px; font-size: 12px;">Free, no credit card required.</div>
      </div>
    </div>
  </td></tr>

  <!-- CLOSING -->
  <tr><td style="padding: 32px 0 24px; text-align: center;">
    <p style="font-family: Georgia, serif; font-style: italic; font-size: 18px; color: #2D3748; line-height: 1.6; margin-bottom: 24px;">
      You reached out. That already took courage.
    </p>
    <div class="muted" style="font-size: 12px;">haven · made with care · <a href="#" style="color: #8A8578; text-decoration: underline;">unsubscribe</a></div>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── Attachment style content map ─────────────────────────────────────────────

export const ATTACHMENT_CONTENT: Record<
    string,
    {
        description: string;
        patterns: Array<{ emoji: string; title: string; description: string }>;
    }
> = {
    anxious: {
        description:
            "You tend to invest deeply in relationships and feel their absence intensely. When things feel uncertain, your nervous system goes into overdrive — not because you're needy, but because connection genuinely matters to you. That's not a flaw. That's who you are.",
        patterns: [
            {
                emoji: "🌙",
                title: "You check your phone more than you'd like",
                description:
                    "When silence stretches too long, the anxiety becomes almost physical. Your attachment system is doing exactly what it was wired to do — seeking reassurance that the connection is still safe.",
            },
            {
                emoji: "🪞",
                title: "You loved more than felt equal",
                description:
                    "Giving more than you received became so familiar it felt like love. It wasn't — it was longing wearing love's clothes. Recognising this is the beginning of changing it.",
            },
            {
                emoji: "🕊️",
                title: "You apologise even when you're unsure why",
                description:
                    "Keeping the peace felt more important than being heard. That's not weakness — it's a strategy that once kept you safe. You're allowed to take up space.",
            },
        ],
    },
    avoidant: {
        description:
            "You've learned to rely on yourself above all else. Closeness can feel like a threat to your independence, so you pull back when things get too intense — not because you don't care, but because caring has felt dangerous before.",
        patterns: [
            {
                emoji: "🚪",
                title: "You pull away when things get too close",
                description:
                    "Distance feels like safety. But what looks like independence is often a very old form of self-protection. You're allowed to let people in.",
            },
            {
                emoji: "🧊",
                title: "You minimise your own pain",
                description:
                    "Telling yourself you're fine, even when you're not, is something you've practiced for a long time. Feeling things fully won't break you — it will free you.",
            },
            {
                emoji: "🔇",
                title: "You go quiet instead of saying what you need",
                description:
                    "Asking for things felt risky. So you stopped asking. But your needs didn't go away — they just went unspoken.",
            },
        ],
    },
    secure: {
        description:
            "You have a strong foundation when it comes to relationships. You're able to give and receive love with relative ease, and you tend to trust that connections can survive difficulties. This pain is real — but your resilience is real too.",
        patterns: [
            {
                emoji: "⚖️",
                title: "You process things more openly than most",
                description:
                    "You're more likely to reach out, talk it through, and seek support. That's a strength — even when it hurts.",
            },
            {
                emoji: "🌱",
                title: "You recover, even when it doesn't feel that way",
                description:
                    "Secure attachment doesn't mean you don't feel pain. It means you have the inner resources to move through it.",
            },
            {
                emoji: "💬",
                title: "You communicate even when it's hard",
                description:
                    "This relationship may have tested that — but your instinct to connect rather than retreat is one of your most valuable traits.",
            },
        ],
    },
    disorganized: {
        description:
            "You both crave and fear closeness at the same time — and that push and pull can be exhausting. This pattern often forms early, as a response to confusing or inconsistent love. It makes sense that you feel conflicted. That conflict is trying to protect you.",
        patterns: [
            {
                emoji: "🌊",
                title: "You feel pulled in two directions at once",
                description:
                    "Wanting closeness while fearing it isn't contradictory — it's the nervous system trying to stay safe in both directions simultaneously.",
            },
            {
                emoji: "🔥",
                title: "Intense emotions come quickly and feel hard to manage",
                description:
                    "When things feel unsafe, the reaction can be big. That's not something wrong with you — it's a survival response that learned to fire too easily.",
            },
            {
                emoji: "🪢",
                title: "Relationships often feel complicated in ways hard to explain",
                description:
                    "You may find yourself in cycles that don't make sense to others. They make sense to your nervous system — even if they hurt you.",
            },
        ],
    },
};