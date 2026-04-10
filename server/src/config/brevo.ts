import { BrevoClient } from "@getbrevo/brevo";
import { env } from "./env";

const brevoClient = new BrevoClient({
  apiKey: env.BREVO_API_KEY.trim(),
});

export const sendOtpEmail = async (toEmail: string, otp: string) => {
  if (!env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  if (!env.BREVO_SENDER_EMAIL) {
    throw new Error(
      "BREVO_SENDER_EMAIL is not configured (or set ADMIN_EMAIL_ADDRESS)",
    );
  }

  try {
    await brevoClient.transactionalEmails.sendTransacEmail({
      sender: {
        email: env.BREVO_SENDER_EMAIL,
        name: env.BREVO_SENDER_NAME,
      },
      to: [{ email: toEmail }],
      subject: "Your HRMS OTP Code",
      htmlContent: `
			<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
				<h2 style="margin-bottom: 12px;">Verify your email</h2>
				<p>Your OTP code is:</p>
				<p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 16px 0;">${otp}</p>
				<p>This code will expire in 10 minutes.</p>
				<p>If you did not request this, you can ignore this email.</p>
			</div>
		`,
      textContent: `Your OTP code is ${otp}. This code will expire in 10 minutes.`,
    });
  } catch (error) {
    const maybeError = error as {
      statusCode?: number;
      body?: { message?: string; code?: string };
    };

    if (maybeError.statusCode === 401) {
      throw new Error(
        "Brevo API key is invalid or revoked. Update BREVO_API_KEY and restart server.",
      );
    }

    const brevoMessage = maybeError.body?.message;
    if (brevoMessage) {
      throw new Error(`Brevo error: ${brevoMessage}`);
    }

    throw error;
  }
};
