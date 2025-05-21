import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from './Spinner';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Debug: Log the roles being checked and current user
  console.log('ProtectedRoute - Allowed roles:', roles, 'Current user role:', user?.role);

  // Show spinner while authentication state is being determined
  if (isLoading) {
    return <Spinner />;
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to home if role restrictions exist and user doesn't have permission
  if (roles.length > 0 && !roles.includes(user.role)) {
    console.log('Role restriction: User does not have required role');
    // You could also show an "unauthorized" message instead of redirecting
    return <Navigate to="/" replace />;
  }

  // Render the protected content
  return children;
};

export default ProtectedRoute;