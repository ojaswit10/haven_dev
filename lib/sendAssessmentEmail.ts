import { Resend } from "resend";
import {
    generateAssessmentEmail,
    ATTACHMENT_CONTENT,
} from "@/lib/emails/assessmentEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const { data, error } = await resend.emails.send({
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