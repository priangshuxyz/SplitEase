import { Router, Request, Response } from 'express';
import { register, login } from '../controllers/authController';
import { body } from 'express-validator';
import { protect } from '../middlewares/auth';

const router = Router();

router.get('/me', protect, (req: Request & { user?: any }, res: Response) => {
    // Standardize user object to match login/register response
    res.json({
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email
        }
    });
});

router.post('/register', [
    body('username').notEmpty().withMessage('Username required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
], register);

router.post('/login', [
    body('email').isEmail(),
    body('password').exists(),
], login);


export default router;