import { type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthGate({ children }: { children: ReactNode }) {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center text-white">
                Loading...
            </div>
        );
    }

    return <>{children}</>;
}
