import { Router } from 'express';
import { protect } from '../middlewares/auth';
import { searchUsers, addFriend, getFriends, removeFriend, updateProfile } from '../controllers/userController';

const router = Router();

router.use(protect);

router.get('/search', searchUsers);
router.get('/friends', getFriends);
router.post('/friends', addFriend);
router.delete('/friends/:friendId', removeFriend);
router.put('/profile', updateProfile);

export default router;
