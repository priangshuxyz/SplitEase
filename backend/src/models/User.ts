import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    phone?: string;
    gender?: 'male' | 'female' | 'other';
    isVerified: boolean;
    otp?: string;
    otpExpires?: Date;
    verificationToken?: string;
    friends: mongoose.Types.ObjectId[];
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema({
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, trim: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpires: { type: Date },
    verificationToken: { type: String },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, {
    timestamps: true
});

UserSchema.pre('save', async function (this: IUser) {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);