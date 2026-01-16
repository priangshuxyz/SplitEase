import { Request, Response } from 'express';
import Group from '../models/Group';
import Settlement from "../models/Settlement";

export const createGroup = async (
    req: Request & { user?: any },
    res: Response
) => {
    try {
        const { name, members = [] } = req.body;

        const group = await Group.create({
            name,
            members: [...new Set([req.user._id, ...members])], // Ensure creator is included and no duplicates
            createdBy: req.user._id,
        });

        return res.status(201).json(group);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to create group' });
    }
};

export const getMyGroups = async (
    req: Request & { user?: any },
    res: Response
) => {
    try {
        const groups = await Group.find({
            members: req.user._id,
        }).populate('members', 'username email');

        return res.status(200).json(groups);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to fetch groups' });
    }
};

export const settleUp = async (
    req: Request & { user?: any },
    res: Response
) => {
    try {
        const { groupId } = req.params;
        const { to, amount } = req.body;

        const settlement = await Settlement.create({
            group: groupId,
            from: req.user._id,
            to,
            amount,
        });

        res.json(settlement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to settle up' });
    }
};

export const addMember = async (
    req: Request & { user?: any },
    res: Response
) => {
    try {
        const { groupId } = req.params;
        const { memberId } = req.body;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Check if user is already a member
        // @ts-ignore
        if (group.members.includes(memberId)) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        group.members.push(memberId);
        await group.save();

        const updatedGroup = await Group.findById(groupId).populate('members', 'username email');
        return res.json(updatedGroup);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to add member' });
    }
};

export const deleteGroup = async (
    req: Request & { user?: any },
    res: Response
) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId);

        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (group.createdBy?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only admin can delete group' });
        }

        // Clean up expenses and settlements (optional but good)
        // Need to import Expense/Settlement if not already. 
        // But for now, let's assumes just deleting group is enough or models will handle cascade if configured (Mongo doesn't by default).
        // Let's do manual cleanup for robustness.
        const Expense = require('../models/Expense').default;
        const Settlement = require('../models/Settlement').default;

        await Expense.deleteMany({ group: groupId });
        await Settlement.deleteMany({ group: groupId });
        await Group.findByIdAndDelete(groupId);

        return res.json({ message: 'Group deleted' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to delete group' });
    }
};

export const removeMember = async (
    req: Request & { user?: any },
    res: Response
) => {
    try {
        const { groupId, memberId } = req.params;
        const group = await Group.findById(groupId);

        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (group.createdBy?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only admin can remove members' });
        }

        // Prevent removing self (admin)
        if (memberId === req.user._id.toString()) {
            return res.status(400).json({ message: "Cannot remove yourself. Delete group instead." });
        }

        // @ts-ignore
        group.members = group.members.filter(m => m.toString() !== memberId);
        await group.save();

        const updatedGroup = await Group.findById(groupId).populate('members', 'username email');
        return res.json(updatedGroup);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to remove member' });
    }
};