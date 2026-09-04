import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AnonRouteProps {
  children: React.ReactNode;
}

export default function AnonRoute({ children }: AnonRouteProps) {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  if (isAuthenticated) {
    const returnTo = searchParams.get('return');
    if (returnTo && returnTo.startsWith('/')) {
      return <Navigate to={returnTo} replace />;
    }
    return <Navigate to="/account" replace />;
  }

  return <>{children}</>;
}
