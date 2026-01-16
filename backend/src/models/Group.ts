import { Schema, model, Types } from 'mongoose';

const groupSchema = new Schema(
    {
        name: { type: String, required: true },
        members: [{ type: Types.ObjectId, ref: 'User' }],
        createdBy: { type: Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

export default model('Group', groupSchema);
