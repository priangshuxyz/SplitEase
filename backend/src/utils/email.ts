
import nodemailer from 'nodemailer';

export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTPEmail = async (email: string, otp: string) => {
    // For development, we can use Ethereal or just log it if no real SMTP is provided.
    // Ideally, use environment variables for SMTP config.
    // Using 'service: gmail' is often more reliable than manual ports for Gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
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
