import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
    // 1. Fetch Config
    const config = await prisma.emailConfig.findFirst();
    if (!config) {
        console.warn('Email config not found. Skipping email sending.');
        return { success: false, error: 'Email configuration missing' };
    }

    // 2. Create Transporter
    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure, // true for 465, false for other ports
        auth: {
            user: config.user,
            pass: config.password,
        },
    });

    try {
        // 3. Send Email
        const info = await transporter.sendMail({
            from: `"${config.fromName}" <${config.fromEmail}>`,
            to,
            subject,
            html,
        });

        console.log('Message sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
}
