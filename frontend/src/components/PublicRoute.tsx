import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicRoute() {
    const { user, loading } = useAuth();

    if (loading) return null;

    return user ? <Navigate to="/groups" /> : <Outlet />;
}
