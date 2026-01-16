import { Request, Response } from 'express';
import Expense from '../models/Expense';
import Group from '../models/Group';

export const getGroupExpenses = async (
    req: Request & { user?: any },
    res: Response
) => {
    try {
        const { groupId } = req.params;

        const expenses = await Expense.find({ group: groupId })
            .populate('paidBy', 'username')
            .sort({ createdAt: -1 });

        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch expenses' });
    }
};


export const createExpense = async (
    req: Request & { user?: any },
    res: Response
): Promise<void> => {
    console.log('🔥 createExpense controller HIT');

    try {
        const { groupId, description, amount } = req.body;

        const group = await Group.findById(groupId);
        if (!group) {
            res.status(404).json({ message: 'Group not found' });
            return;
        }

        const members = group.members;
        const splitAmount = Number((amount / members.length).toFixed(2));

        const splits = members.map((memberId, index) => {
            let userSplit = splitAmount;
            // Add remainder to the first person to ensure sum matches total
            if (index === 0) {
                userSplit = Number((splitAmount + (amount - splitAmount * members.length)).toFixed(2));
            }
            return {
                user: memberId,
                amount: userSplit,
            };
        });

        const expense = new Expense({
            group: groupId,
            description,
            amount,
            paidBy: req.user._id,
            splits,
        });

        await expense.save();

        res.status(201).json(expense);
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create expense' });
        return;
    }
};

export const deleteExpense = async (
    req: Request & { user?: any },
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const expense = await Expense.findById(id);

        if (!expense) {
            res.status(404).json({ message: 'Expense not found' });
            return;
        }

        const group = await Group.findById(expense.group);
        if (!group) {
            res.status(404).json({ message: 'Group not found' });
            return;
        }

        // Allow delete if user is the payer OR the group admin
        if (expense.paidBy.toString() !== req.user._id.toString() && group.createdBy?.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'Not authorized to delete this expense' });
            return;
        }

        await Expense.findByIdAndDelete(id);
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete expense' });
    }
};
