import express from 'express';
import { getBalances, getSettleUp, settleUp, getDashboardBalances } from '../controllers/balanceController';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.get('/dash', protect, getDashboardBalances);
router.get('/:groupId', protect, getBalances);
router.get('/settle/:groupId', protect, getSettleUp);
router.post('/settle/:groupId', protect, settleUp);

export default router;
