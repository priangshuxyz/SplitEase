import { Request, Response } from 'express';
import Expense from '../models/Expense';
import Settlement from '../models/Settlement';
import Group from '../models/Group';

/**
 * Calculate balances from expenses and settlements
 */
const calculateBalances = async (groupId: string) => {
    const expenses = await Expense.find({ group: groupId });
    const settlements = await Settlement.find({ group: groupId });

    const balances: Record<string, number> = {};

    // 1️⃣ Apply expenses
    expenses.forEach(exp => {
        const paidBy = exp.paidBy.toString();
        balances[paidBy] = (balances[paidBy] || 0) + exp.amount;

        exp.splits.forEach(split => {
            if (!split.user || split.amount == null) return;
            const userId = split.user.toString();
            balances[userId] = (balances[userId] || 0) - split.amount;
        });
    });

    // 2️⃣ Apply settlements
    settlements.forEach(s => {
        const from = s.from.toString();
        const to = s.to.toString();

        balances[from] = (balances[from] || 0) + s.amount;
        balances[to] = (balances[to] || 0) - s.amount;
    });

    // Round balances to 2 decimal places to avoid floating point issues
    Object.keys(balances).forEach(userId => {
        balances[userId] = Math.round(balances[userId]! * 100) / 100;
    });

    return balances;
};

/**
 * GET /balances/:groupId
 * Return balances per user
 */
export const getBalances = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { groupId } = req.params;

        if (!groupId) {
            res.status(400).json({ message: 'Group ID required' });
            return;
        }

        const balances = await calculateBalances(groupId);
        res.status(200).json(balances);
        return;
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to get balances' });
        return;
    }
};

/**
 * GET /balances/settle/:groupId
 * Generate settle-up instructions
 */
export const getSettleUp = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { groupId } = req.params;

        if (!groupId) {
            res.status(400).json({ message: 'Group ID required' });
            return;
        }

        const balances = await calculateBalances(groupId);

        const debtors: { user: string; amount: number }[] = [];
        const creditors: { user: string; amount: number }[] = [];

        Object.entries(balances).forEach(([user, amount]) => {
            if (amount < -0.01) debtors.push({ user, amount: -amount });
            if (amount > 0.01) creditors.push({ user, amount });
        });

        const settlements: any[] = [];

        let i = 0;
        let j = 0;

        while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];

            if (!debtor || !creditor) break;

            // Calculate settle amount with precision handling
            let settleAmount = Math.min(debtor.amount, creditor.amount);
            settleAmount = Math.round(settleAmount * 100) / 100;

            if (settleAmount > 0) {
                settlements.push({
                    from: debtor.user,
                    to: creditor.user,
                    amount: settleAmount,
                });

                debtor.amount -= settleAmount;
                creditor.amount -= settleAmount;

                // Precision cleanup after subtraction
                debtor.amount = Math.round(debtor.amount * 100) / 100;
                creditor.amount = Math.round(creditor.amount * 100) / 100;
            }

            if (debtor.amount <= 0.001) i++;
            if (creditor.amount <= 0.001) j++;
        }

        res.status(200).json(settlements);
        return;
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to calculate settle-up' });
        return;
    }
};

/**
 * POST /balances/settle/:groupId
 * Persist a settlement (Pay action)
 */
export const settleUp = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { groupId } = req.params;
        const { to, amount } = req.body;

        if (!groupId || !to || !amount) {
            res.status(400).json({ message: 'Missing fields' });
            return;
        }

        await Settlement.create({
            group: groupId,
            from: userId,
            to,
            amount,
        });

        res.status(201).json({ success: true });
        return;
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to settle' });
        return;
    }
};

/**
 * GET /balances/dash
 * Aggregate balances across all groups for the current user
 */
export const getDashboardBalances = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = (req as any).user._id;

        // Find all groups user is part of
        const groups = await Group.find({ members: userId });

        let totalBalance = 0;
        let youOwe = 0;
        let owedToYou = 0;

        for (const group of groups) {
            const balances = await calculateBalances(group._id.toString());
            const myBal = balances[userId.toString()] || 0;

            totalBalance += myBal;
            if (myBal > 0) owedToYou += myBal;
            if (myBal < 0) youOwe += Math.abs(myBal);
        }

        // Round for display
        totalBalance = Math.round(totalBalance * 100) / 100;
        youOwe = Math.round(youOwe * 100) / 100;
        owedToYou = Math.round(owedToYou * 100) / 100;

        res.status(200).json({
            totalBalance,
            youOwe,
            owedToYou
        });
    } catch (err) {
        console.error("Dashboard stats error:", err);
        res.status(500).json({ message: 'Failed to get dashboard stats' });
    }
};
