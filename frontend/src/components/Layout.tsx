import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
    const { logout, user } = useAuth();
    const location = useLocation();

    const navItems = [
        { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
        { label: 'Groups', path: '/groups', icon: '🫂' },
        { label: 'Friends', path: '/friends', icon: '👤' },
        { label: 'Settings', path: '/settings', icon: '⚙️' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-950 text-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-800 p-6 flex flex-col justify-between hidden md:flex sticky top-0 h-screen">
                <div>
                    <div className="flex items-center gap-2 mb-10">
                        <span className="text-2xl font-bold bg-gradient-to-tr from-green-400 to-green-600 bg-clip-text text-transparent">
                            SplitShare
                        </span>
                    </div>

                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-gray-800 text-white font-medium'
                                        : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
                                        }`}
                                >
                                    <span>{item.icon}</span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div>
                    <div className="mb-4 px-4">
                        <p className="text-sm text-gray-500">Signed in as</p>
                        <p className="font-medium truncate">{user?.username}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-900 rounded transition-colors"
                    >
                        Logout
                    </button>
                    {/* Settings Toggles could go here */}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
