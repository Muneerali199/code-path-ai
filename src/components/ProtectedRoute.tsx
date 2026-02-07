import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PageLoader from '@/components/ui/PageLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard that:
 *  1. Shows a loading spinner while Firebase auth is resolving
 *  2. Redirects to /auth if the user is not authenticated
 *  3. Renders children once authenticated
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // While auth is resolving, show a visible loader instead of blank screen
  if (loading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
