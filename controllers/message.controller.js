import { sendEmail } from '../services/email.service.js';
import { contactUsUserTemplate, contactUsAdminTemplate } from '../constants/email.templates.js';
import { application } from '../config/application.js';
import { logAction } from '../utils/logger.js';

export const submitContactForm = async (req, res) => {
    try {
        const { firstName, lastName, email, subject, message } = req.body;

        if (!firstName || !lastName || !email || !subject || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // 1. Send "Thank You" email to the user
        const userEmailContent = contactUsUserTemplate(firstName);
        await sendEmail({
            to: email,
            subject: userEmailContent.subject,
            html: userEmailContent.html
        });

        // 2. Send "New Inquiry" email to the admin
        const adminEmailContent = contactUsAdminTemplate({ firstName, lastName, email, subject, message });

        // Using EMAIL_USER as the admin email recipient
        await sendEmail({
            to: application.EMAIL_USER,
            subject: adminEmailContent.subject,
            html: adminEmailContent.html
        });

        // Log the action (only if admin is testing the form)
        if (req.user) {
            await logAction(req.user, "CONTACT_FORM_SUBMISSION", {
                senderEmail: email,
                senderName: `${firstName} ${lastName}`,
                subject
            });
        }

        res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("Contact form error:", error);
        res.status(500).json({ message: "Failed to send message" });
    }
};
