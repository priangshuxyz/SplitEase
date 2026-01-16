import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';


function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);   // 🔥 THIS WAS MISSING
            navigate('/groups');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <AuthNavbar />
            <div className="flex items-center justify-center px-6 py-24">
                <form
                    onSubmit={handleSubmit}
                    className="bg-gray-900 p-8 rounded-lg w-96 shadow-lg"
                >
                    <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

                    {error && (
                        <div className="mb-4 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full mb-4 p-2 rounded bg-gray-800 border border-gray-700"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full mb-6 p-2 rounded bg-gray-800 border border-gray-700"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
