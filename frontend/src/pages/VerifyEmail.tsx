import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMsg('No token provided.');
            return;
        }

        api.post('/auth/verify-email', { token })
            .then(() => {
                setStatus('success');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            })
            .catch((err) => {
                setStatus('error');
                setMsg(err.response?.data?.message || 'Verification failed.');
            });
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
            <div className="bg-gray-900 p-8 rounded-lg max-w-md w-full text-center border border-gray-800">
                <h1 className="text-2xl font-bold mb-4">Email Verification</h1>

                {status === 'verifying' && (
                    <p className="text-blue-400 animate-pulse">Verifying your email...</p>
                )}

                {status === 'success' && (
                    <div>
                        <p className="text-green-500 text-lg mb-2">✅ Email verified successfully!</p>
                        <p className="text-gray-400">Redirecting to login...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div>
                        <p className="text-red-500 text-lg mb-2">❌ Verification failed</p>
                        <p className="text-gray-400">{msg}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-4 bg-gray-800 px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Go to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
