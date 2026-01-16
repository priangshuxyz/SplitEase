import { Request, Response } from 'express';
import User from '../models/User';

// Search users by email or username
export const searchUsers = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.json([]);
        }

        // @ts-ignore
        const currentUserId = req.user._id;

        const users = await User.find({
            $or: [
                { email: { $regex: query, $options: 'i' } },
                { username: { $regex: query, $options: 'i' } }
            ],
            _id: { $ne: currentUserId } // Exclude self
        } as any).select('username email avatar'); // Cast to any to bypass strict typing if complex query

        return res.json(users);
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const addFriend = async (req: Request, res: Response) => {
    try {
        const { friendId } = req.body;
        // @ts-ignore
        const userId = req.user._id;

        if (userId === friendId) {
            return res.status(400).json({ message: "You can't befriend yourself" });
        }

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.friends.includes(friendId)) {
            return res.status(400).json({ message: 'Already friends' });
        }

        user.friends.push(friendId);
        // Optional: Two-way friendship? For now, we'll confirm immediate friendship or just follow style.
        // Let's do 1-way for simplicity or check if the other also needs to add.
        // For standard splitwise, it's usually automatic mutual or invite based.
        // Let's do mutual add for simplicity now.
        if (!friend.friends.includes(userId)) {
            friend.friends.push(userId);
            await friend.save();
        }

        await user.save();

        return res.json({ message: 'Friend added', friend: { id: friend._id, username: friend.username, email: friend.email } });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const getFriends = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const user = await User.findById(req.user._id).populate('friends', 'username email avatar');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json(user.friends);
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const removeFriend = async (req: Request, res: Response) => {
    try {
        const { friendId } = req.params;
        // @ts-ignore
        const userId = req.user._id;

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove from user's friends
        user.friends = user.friends.filter(id => id.toString() !== friendId);
        await user.save();

        // Remove from friend's friends (Mutual unfriend)
        friend.friends = friend.friends.filter(id => id.toString() !== userId);
        await friend.save();

        return res.json({ message: 'Friend removed' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user._id;
        const { username, phone, gender, email } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (username) user.username = username;
        if (phone) user.phone = phone;
        if (gender) user.gender = gender;

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = email;
            // Optionally reset verification status here if email changes
            user.isVerified = false;
        }

        await user.save();

        return res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                isVerified: user.isVerified
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};
