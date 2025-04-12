
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

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

  // Render children if authenticated
  return <>{children}</>;
};

export default PrivateRoute;
