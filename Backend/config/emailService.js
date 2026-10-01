import nodemailer from "nodemailer";

let transporter = null;

// Initialize email transporter
export function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER?.trim() || process.env.SMTP_USER?.trim();
  const rawPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const pass = rawPass ? rawPass.replace(/\s+/g, "") : "";

  if (user && pass) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  } else {
    // Fallback: local logger transporter for development
    transporter = {
      sendMail: async (mailOptions) => {
        console.log("\n========================================");
        console.log(`📧 [EMAIL SENT (DEV MODE)]`);
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Text / Body: ${mailOptions.text || mailOptions.html}`);
        console.log("========================================\n");
        return { messageId: `dev-mode-${Date.now()}` };
      },
    };
  }

  return transporter;
}

export async function sendOtpEmail(toEmail, otpCode, studentName = "Student") {
  const mailer = getTransporter();

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 25px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #FFFFFF;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #2563EB; margin: 0;">University Course Matcher</h2>
        <p style="color: #64748B; font-size: 14px; margin-top: 5px;">Password Reset Verification Code</p>
      </div>

      <p style="color: #1E293B; font-size: 15px;">Hello <strong>${studentName}</strong>,</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.5;">
        You recently requested to reset your password for your University Course Matching account. Please use the 6-digit verification code below to proceed:
      </p>

      <div style="text-align: center; margin: 25px 0;">
        <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1D4ED8; background-color: #EFF6FF; padding: 12px 24px; border-radius: 8px; border: 1px dashed #3B82F6;">
          ${otpCode}
        </span>
      </div>

      <p style="color: #64748B; font-size: 13px; line-height: 1.5;">
        ⏳ This code will expire in <strong>15 minutes</strong>. If you did not request this password reset, please ignore this email.
      </p>

      <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 25px 0;" />
      <p style="text-align: center; color: #94A3B8; font-size: 12px; margin: 0;">
        &copy; ${new Date().getFullYear()} University Course Matching System. Sri Lanka.
      </p>
    </div>
  `;

  const textContent = `Your University Course Matcher password reset code is: ${otpCode}. It will expire in 15 minutes.`;

  const senderEmail = process.env.EMAIL_USER || "noreply@coursematch.lk";
  return await mailer.sendMail({
    from: `"University Course Matcher" <${senderEmail}>`,
    to: toEmail,
    subject: `🔐 ${otpCode} is your Password Reset Code`,
    text: textContent,
    html: htmlContent,
  });
}
