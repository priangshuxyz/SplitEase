import { Resend } from 'resend';

// Helper to generate OTP matching authController logic
export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTPEmail = async (email: string, otp: string) => {
    // Check if API Key exists
    if (!process.env.RESEND_API_KEY) {
        console.log(`\n📧 [MOCK EMAIL - NO RESEND KEY] To: ${email} | OTP: ${otp}\n`);
        return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { data, error } = await resend.emails.send({
            from: 'SplitEase <onboarding@resend.dev>', // Default testing domain
            to: [email],
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

        if (error) {
            console.error('Resend API Error:', error);
            throw error;
        }

        console.log('Resend Email Sent:', data);
    } catch (err) {
        console.error('Failed to send email via Resend:', err);
        throw err; // Re-throw to be caught by controller
    }
};
