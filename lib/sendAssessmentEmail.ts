import { Resend } from "resend";
import {
    generateAssessmentEmail,
    ATTACHMENT_CONTENT,
} from "@/lib/emails/assessmentEmail";

// Create the Resend client lazily (on first send), NOT at import time.
// `next build` imports every route to collect page data; during a Docker build
// secrets are deliberately absent, and `new Resend(undefined)` throws.
let resendClient: Resend | null = null;
function getResend() {
    if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
    return resendClient;
}

interface SendAssessmentEmailParams {
    to: string;
    attachmentStyle: "anxious" | "avoidant" | "secure" | "disorganized";
}

export async function sendAssessmentEmail({
    to,
    attachmentStyle,
}: SendAssessmentEmailParams) {
    const content = ATTACHMENT_CONTENT[attachmentStyle];

    const html = generateAssessmentEmail({
        attachmentStyle:
            attachmentStyle.charAt(0).toUpperCase() + attachmentStyle.slice(1) + " Attachment",
        attachmentDescription: content.description,
        onePattern: content.patterns[0],
    });

    const { data, error } = await getResend().emails.send({
        from: "haven <hello@tryhaven.me>",
        to,
        subject: "Your haven reflection is ready",
        html,
    });

    if (error) {
        console.error("Email send error:", error);
        throw new Error("Failed to send assessment email");
    }

    return data;
}