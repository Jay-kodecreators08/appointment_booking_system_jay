import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();

  if (!user) {
    const loginPath = role === 'ADMIN' ? '/admin/login' : '/login';
    return <Navigate to={loginPath} replace />;
  }

  if (role && user.role !== role) {
    const homePath = user.role === 'ADMIN' ? '/admin/dashboard' : '/patient/dashboard';
    return <Navigate to={homePath} replace />;
  }

  return children;
}
