import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import AuthNavbar from '../components/AuthNavbar';


export default function Register() {
    const navigate = useNavigate();
    const auth = useAuth();

    const [step, setStep] = useState(1); // 1: Signup, 2: OTP
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/register', {
                username,
                email,
                password,
            });
            setMessage(res.data.message);
            setStep(2);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/verify-otp', {
                email,
                otp
            });

            // Save token
            localStorage.setItem('token', res.data.token);

            // Set user in context
            // Set user in context
            auth.setUser(res.data.user);

            navigate('/dashboard');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setMessage('');
        setError('');
        try {
            await api.post('/auth/resend-otp', { email });
            setMessage('New OTP sent to your email.');
        } catch (err: any) {
            setError('Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <AuthNavbar />

            <div className="flex items-center justify-center px-6 py-24">
                <div className="bg-gray-900 p-8 rounded-lg w-full max-w-md border border-gray-800">
                    <h1 className="text-3xl font-bold mb-6 text-center">
                        {step === 1 ? 'Create an account' : 'Verify Email'}
                    </h1>

                    {error && (
                        <p className="bg-red-600/20 text-red-400 p-2 rounded mb-4 text-sm text-center">
                            {error}
                        </p>
                    )}

                    {message && (
                        <p className="bg-green-600/20 text-green-400 p-2 rounded mb-4 text-sm text-center">
                            {message}
                        </p>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleRegister}>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full p-3 mb-3 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 outline-none transition"
                                required
                            />

                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full p-3 mb-3 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 outline-none transition"
                                required
                            />

                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full p-3 mb-5 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 outline-none transition"
                                required
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded font-semibold disabled:opacity-50 transition"
                            >
                                {loading ? 'Creating account…' : 'Register'}
                            </button>

                            <p className="text-sm text-gray-400 mt-4 text-center">
                                Already have an account?{' '}
                                <Link to="/login" className="text-blue-400 hover:underline">
                                    Login
                                </Link>
                            </p>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify}>
                            <p className="text-gray-400 text-sm mb-4 text-center">
                                We sent a 6-digit code to <span className="text-white font-medium">{email}</span>.
                            </p>

                            <input
                                type="text"
                                placeholder="Enter 6-digit Code"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full p-3 mb-4 bg-gray-800 rounded border border-gray-700 focus:border-green-500 outline-none text-center text-xl tracking-[0.5em] font-mono transition"
                                required
                                maxLength={6}
                            />

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full bg-green-600 hover:bg-green-700 py-3 rounded font-semibold disabled:opacity-50 transition mb-3"
                            >
                                {loading ? 'Verifying…' : 'Verify & Login'}
                            </button>

                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={loading}
                                className="w-full text-blue-400 hover:text-blue-300 text-sm transition"
                            >
                                Resend Code
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
