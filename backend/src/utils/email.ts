
import nodemailer from 'nodemailer';

export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTPEmail = async (email: string, otp: string) => {
    // For development, we can use Ethereal or just log it if no real SMTP is provided.
    // Ideally, use environment variables for SMTP config.
    // Use SendGrid (Recommended for Production)
    // User needs to set SENDGRID_API_KEY in environment variables
    const transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
            user: 'apikey', // This is the required username for SendGrid
            pass: process.env.SENDGRID_API_KEY // The API Key from SendGrid
        },
        logger: true,
        debug: true
    });

    // Fallback if no env vars (Mock mode for dev)
    if (!process.env.EMAIL_USER) {
        console.log(`\n📧 [MOCK EMAIL] To: ${email} | OTP: ${otp}\n`);
        return;
    }

    const mailOptions = {
        from: `"SplitEase" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your SplitEase Verification Code',
        text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
        html: `<b>Your verification code is: ${otp}</b><br>It expires in 10 minutes.`
    };

    await transporter.sendMail(mailOptions);
};
