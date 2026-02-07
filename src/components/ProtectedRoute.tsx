import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard that:
 *  1. Returns null while Firebase auth is resolving (HTML shell stays visible)
 *  2. Redirects to /auth if the user is not authenticated
 *  3. Renders children once authenticated
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // While auth is resolving, return nothing — the index.html inline
  // loader or Suspense fallback is already visible
  if (loading) return null;

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
