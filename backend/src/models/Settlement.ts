import mongoose, { Schema, Document } from 'mongoose';

export interface ISettlement extends Document {
    group: mongoose.Types.ObjectId;
    from: mongoose.Types.ObjectId; // payer (debtor)
    to: mongoose.Types.ObjectId;   // receiver (creditor)
    amount: number;
    createdAt: Date;
}

const settlementSchema = new Schema<ISettlement>(
    {
        group: {
            type: Schema.Types.ObjectId,
            ref: 'Group',
            required: true,
        },
        from: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        to: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model<ISettlement>('Settlement', settlementSchema);
