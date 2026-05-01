import nodemailer, { Transporter } from 'nodemailer';

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter;
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  cachedTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
  return cachedTransporter;
}

export function isEmailConfigured(): boolean {
  return !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD;
}

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[email] GMAIL_USER / GMAIL_APP_PASSWORD not set; skipping send. Reset URL:', resetUrl);
    return;
  }

  const from = process.env.GMAIL_USER!;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#222;">
      <h2 style="color:#b537f2;margin:0 0 16px;">Reset your LifeAdmin password</h2>
      <p>Someone (hopefully you) requested a password reset for your LifeAdmin account.</p>
      <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
      <p style="margin:28px 0;">
        <a href="${resetUrl}" style="background:#b537f2;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;display:inline-block;">
          Reset Password
        </a>
      </p>
      <p style="font-size:12px;color:#666;">Or paste this link into your browser:<br>${resetUrl}</p>
      <p style="font-size:12px;color:#666;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"LifeAdmin" <${from}>`,
    to: toEmail,
    subject: 'Reset your LifeAdmin password',
    text: `Reset your password by visiting: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
    html,
  });
}
