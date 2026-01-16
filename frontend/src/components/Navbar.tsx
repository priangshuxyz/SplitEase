import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-800 bg-gray-950">

            {/* Left: Logo + Home */}
            <div className="flex items-center gap-6">
                <Link
                    to="/"
                    className="text-lg font-semibold text-white hover:opacity-90"
                >
                    SplitEase
                </Link>

                <Link
                    to="/"
                    className="text-sm text-gray-400 hover:text-white"
                >
                    Home
                </Link>
            </div>

            {/* Right: User + Logout */}
            <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">
                    {user?.username}
                </span>

                <button
                    onClick={logout}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}
