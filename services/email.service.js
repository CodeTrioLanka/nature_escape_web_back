import nodemailer from "nodemailer";
import { welcomeTemplate } from "../constants/email.templates.js";
import { application } from "../config/application.js";

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: application.EMAIL_HOST,
      port: application.EMAIL_PORT,
      secure: application.EMAIL_SECURE,
      auth: {
        user: application.EMAIL_USER,
        pass: application.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, html }) {
  const mailOptions = {
    from: `"${application.EMAIL_FROM_NAME}" <${application.EMAIL_FROM}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log(`Email sent to ${to}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}



