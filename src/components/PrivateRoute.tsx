
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { user, loading, userRole } = useAuth();

  // Show loading state if auth is still initializing
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-aura-darkPurple">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-aura-blue border-t-transparent"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirements if specified
  if (requiredRole && userRole !== requiredRole) {
    // If admin role is required but user isn't admin, redirect to home
    if (requiredRole === 'admin' && userRole !== 'admin') {
      return <Navigate to="/home" replace />;
    }
  }

  // Render children if authenticated and meets role requirements
  return <>{children}</>;
};

export default PrivateRoute;
