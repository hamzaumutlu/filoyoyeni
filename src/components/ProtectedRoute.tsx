import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
    requireSuperAdmin?: boolean;
}

export default function ProtectedRoute({
    children,
    requireAdmin = false,
    requireSuperAdmin = false
}: ProtectedRouteProps) {
    const { user, loading, isAdmin, isSuperAdmin } = useAuth();
    const location = useLocation();
    const [timedOut, setTimedOut] = useState(false);

    // If loading takes more than 3 seconds, stop waiting and redirect to login
    useEffect(() => {
        if (!loading) return;
        const timer = setTimeout(() => setTimedOut(true), 3000);
        return () => clearTimeout(timer);
    }, [loading]);

    if (loading && !timedOut) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-[var(--color-accent-orange)] animate-spin mx-auto mb-4" />
                    <p className="text-[var(--color-text-secondary)]">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireSuperAdmin && !isSuperAdmin) {
        return <Navigate to="/" replace />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
