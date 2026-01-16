import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import groupRoutes from './routes/groupRoutes';
import dotenv from 'dotenv';
import cors from 'cors';
import expenseRoutes from './routes/expenseRoutes';
import balanceRoutes from './routes/balanceRoutes';
import userRoutes from './routes/userRoutes';


dotenv.config();

const app = express();
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5000',
            process.env.FRONTEND_URL // Allow explicitly defined URL
        ];

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin); // Log blocked origins for debugging
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api/expenses', expenseRoutes);
app.use('/api/balances', balanceRoutes);


mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/splitease')
    .then(() => console.log('MongoDB connected '))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_req, res) => {
    res.json({ status: 'SplitEase API running like a beast 🔥' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server crushing it on port ${PORT}`);
});