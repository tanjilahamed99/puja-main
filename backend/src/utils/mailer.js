// utils/mailer.js
const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html, text, from }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: from || `"Karmkand Bharti" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      ...(text ? { text } : {}),
    };

    await transporter.sendMail(mailOptions);
    console.log(`[mailer] Email sent to ${to}`);
    return { ok: true };
  } catch (error) {
    console.error("[mailer] Email sending failed:", error);
    // Don't throw — callers treat email as fire-and-forget
    return { ok: false, error: error?.message || String(error) };
  }
};

module.exports = sendEmail;