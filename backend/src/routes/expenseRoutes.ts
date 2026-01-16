import { Router } from 'express';
import { createExpense, deleteExpense } from '../controllers/expenseController';
import { protect } from '../middlewares/auth';
import { getGroupExpenses } from '../controllers/expenseController';

const router = Router();

router.post('/', protect, createExpense);
router.get('/group/:groupId', protect, getGroupExpenses);
router.delete('/:id', protect, deleteExpense);


export default router;
