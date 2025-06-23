
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { hasRequiredRole, isDirectAccessEnabled } from "@/utils/authUtils";

interface PrivateRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
}

const PrivateRoute = ({ children, requiredRole }: PrivateRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Allow direct access only in development mode
  if (isDirectAccessEnabled()) {
    console.log("Direct access enabled - bypassing authentication");
    return <>{children}</>;
  }

  // Check authentication
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check role requirements
  if (!hasRequiredRole(user, requiredRole)) {
    return <Navigate to="/home" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
