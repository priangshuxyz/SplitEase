import { Link, useLocation } from 'react-router-dom';

export default function AuthNavbar() {
    const location = useLocation();
    const isLogin = location.pathname === '/login';

    return (
        <nav className="flex justify-between items-center px-8 py-5 border-b border-gray-800">

            {/* Left: Logo */}
            <Link
                to="/"
                className="text-xl font-semibold text-white hover:opacity-90"
            >
                SplitEase
            </Link>

            {/* Right: Home + Auth action */}
            <div className="flex items-center gap-6 text-sm">
                <Link
                    to="/"
                    className="text-gray-400 hover:text-white"
                >
                    Home
                </Link>

                {isLogin ? (
                    <Link
                        to="/register"
                        className="text-gray-300 hover:text-white"
                    >
                        Create account
                    </Link>
                ) : (
                    <Link
                        to="/login"
                        className="text-gray-300 hover:text-white"
                    >
                        Sign in
                    </Link>
                )}
            </div>
        </nav>
    );
}
