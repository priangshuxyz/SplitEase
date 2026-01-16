
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';

// Load .env explicitly
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('Testing Email Configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '********' : 'Not Set');

const sendTestEmail = async () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Missing email credentials in .env');
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        console.log('Attempting to send email...');
        const info = await transporter.sendMail({
            from: `"SplitEase Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'SplitEase Email Test',
            text: 'If you see this, your email configuration works!'
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error: any) {
        console.error('❌ Email failed to send:');
        console.error(error);
        process.exit(1);
    }
};

sendTestEmail();
