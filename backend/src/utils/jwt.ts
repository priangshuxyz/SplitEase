import jwt from 'jsonwebtoken';

export const generateToken = (id: string): string => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET is not defined in your .env file');
    }

    // Explicitly type the options object to satisfy TypeScript
    const options: jwt.SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d',
    };

    // Payload can be typed loosely – jwt accepts plain objects
    const payload = { id };

    return jwt.sign(payload, secret, options);
};