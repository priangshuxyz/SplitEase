import { Schema, model, Types } from 'mongoose';

const expenseSchema = new Schema(
  {
    group: { type: Types.ObjectId, ref: 'Group', required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },

    paidBy: { type: Types.ObjectId, ref: 'User', required: true },

    splits: [
      {
        user: { type: Types.ObjectId, ref: 'User' },
        amount: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

export default model('Expense', expenseSchema);
