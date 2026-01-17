import nodemailer from 'nodemailer';

// Helper to generate OTP matching authController logic
export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTPEmail = async (email: string, otp: string) => {
    // Check if Credentials exist
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`\n📧 [MOCK EMAIL - NO CREDENTIALS] To: ${email} | OTP: ${otp}\n`);
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

        const info = await transporter.sendMail({
            from: `"SplitEase" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your SplitEase Verification Code',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to SplitEase!</h2>
                    <p>Your verification code is:</p>
                    <h1 style="background-color: #f4f4f5; padding: 20px; text-align: center; letter-spacing: 5px; border-radius: 8px;">${otp}</h1>
                    <p>This code expires in 10 minutes.</p>
                </div>
            `
        });

        console.log('Nodemailer Email Sent:', info.messageId);
    } catch (err) {
        console.error('Failed to send email via Nodemailer:', err);
        throw err; // Re-throw to be caught by controller
    }
};
