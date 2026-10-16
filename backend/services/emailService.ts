import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || 'HEAL Engine <auth@healengine.local>';

// Lazily instantiate Resend client if API key is provided
let resendClient: Resend | null = null;
if (apiKey) {
  try {
    resendClient = new Resend(apiKey);
  } catch (err: any) {
    console.warn('[EMAIL-SERVICE] Notice: Resend client initialization deferred:', err.message);
  }
}

export interface SendOtpEmailResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

/**
 * Sends a transactional OTP email using Resend.
 * In development or testing without a configured RESEND_API_KEY,
 * falls back to simulated safe logging without exposing secrets.
 */
export async function sendOtpEmail(
  recipient: string,
  otp: string,
  purpose: 'signup' | 'login' | 'verification' = 'verification'
): Promise<SendOtpEmailResult> {
  const normalizedRecipient = recipient.toLowerCase().trim();
  const isDevOrTest = process.env.NODE_ENV !== 'production' || !apiKey;

  // If Resend API key is present and not dummy placeholder
  if (apiKey && apiKey !== 'CHANGE_ME_RESEND_KEY' && apiKey.startsWith('re_')) {
    if (!resendClient) {
      resendClient = new Resend(apiKey);
    }

    try {
      const subject = purpose === 'login'
        ? 'Your HEAL Engine Sign-In Code'
        : purpose === 'signup'
          ? 'Welcome to HEAL Engine — Verify Your Account'
          : 'Your HEAL Engine Verification Code';

      const { data, error } = await resendClient.emails.send({
        from: emailFrom,
        to: normalizedRecipient,
        subject,
        text: `Your HEAL Engine verification code is ${otp}. It expires in 5 minutes. If you did not request this code, please disregard this email.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
              <h2 style="color: #0f172a; margin: 0; font-size: 20px;">HEAL Engine Clinical Intelligence</h2>
            </div>
            <p style="color: #475569; font-size: 15px; line-height: 1.5;">
              Use the following single-use verification code to authenticate your session:
            </p>
            <div style="background: #f1f5f9; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0284c7; font-family: monospace;">
                ${otp}
              </span>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.4;">
              This code will expire in 5 minutes and can only be used once. For security reasons, never share this code with anyone.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">
              HEAL Engine Security Operations · Zero-Trust Clinical Architecture
            </p>
          </div>
        `
      });

      if (error) {
        // Safe operational logging: NEVER log the OTP code or patient PHI
        console.error('[EMAIL-SERVICE] Resend delivery error for recipient domain:', normalizedRecipient.split('@')[1], error.name);
        return { success: false, error: 'Verification email could not be delivered' };
      }

      console.log(`[EMAIL-SERVICE] ✓ Verification email dispatched via Resend to ${normalizedRecipient.replace(/(?<=.).(?=.*@)/g, '*')}`);
      return { success: true, messageId: data?.id };
    } catch (err: any) {
      console.error('[EMAIL-SERVICE] Failed to dispatch via Resend:', err.message);
      return { success: false, error: 'Verification email service unavailable' };
    }
  }

  // Safe simulated mode for development and test suites
  if (isDevOrTest) {
    console.log(`[EMAIL-SERVICE-DEV] OTP generated for ${normalizedRecipient.replace(/(?<=.).(?=.*@)/g, '*')}: [6-DIGIT CODE PREPARED] (Resend simulated)`);
    return { success: true, simulated: true };
  }

  throw new Error('Email provider configuration is missing');
}
