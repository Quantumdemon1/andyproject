
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { user, loading, userRole } = useAuth();
  const location = useLocation();
  const [bypassAuth, setBypassAuth] = useState(false);
  
  // Check if we're coming from the login page with the bypass flag
  useEffect(() => {
    // Check if we have a bypass flag in sessionStorage
    const hasDirectAccess = sessionStorage.getItem('direct_access') === 'true';
    if (hasDirectAccess) {
      setBypassAuth(true);
    }
    
    // If we're at the home route and came from login, consider it a direct access
    if (location.pathname === '/home' && document.referrer.includes('/login')) {
      sessionStorage.setItem('direct_access', 'true');
      setBypassAuth(true);
    }
  }, [location]);

  // Show loading state if auth is still initializing
  if (loading && !bypassAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-aura-darkPurple">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-aura-blue border-t-transparent"></div>
      </div>
    );
  }

  // Allow access if user is authenticated OR we have bypass
  if (!user && !bypassAuth) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirements if specified and not bypassing
  if (requiredRole && userRole !== requiredRole && !bypassAuth) {
    // If admin role is required but user isn't admin, redirect to home
    if (requiredRole === 'admin') {
      return <Navigate to="/home" replace />;
    }
  }

  // Render children if authenticated and meets role requirements
  return <>{children}</>;
};

export default PrivateRoute;
