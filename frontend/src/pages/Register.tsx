import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import AuthNavbar from '../components/AuthNavbar';


export default function Register() {
    const navigate = useNavigate();
    const auth = useAuth();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

            // Save token
            localStorage.setItem('token', res.data.token);

            // Set user in context
            auth.setUser(res.data.user);

            navigate('/dashboard');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Registration failed');
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
                        Create an account
                    </h1>

                    {error && (
                        <p className="bg-red-600/20 text-red-400 p-2 rounded mb-4 text-sm text-center">
                            {error}
                        </p>
                    )}

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
                </div>
            </div>
        </div>
    );
}
