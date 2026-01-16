import { Router } from 'express';
import { protect } from '../middlewares/auth';
import { createGroup, getMyGroups, settleUp, addMember, deleteGroup, removeMember } from '../controllers/groupController';

const router = Router();

router.post('/', protect, createGroup);
router.get('/my', protect, getMyGroups);
router.post("/:groupId/settle", protect, settleUp);
router.post("/:groupId/members", protect, addMember);
router.delete("/:groupId", protect, deleteGroup);
router.delete("/:groupId/members/:memberId", protect, removeMember);


export default router;
