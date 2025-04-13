
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Collections from "./pages/Collections";
import Vault from "./pages/Vault";
import Queue from "./pages/Queue";
import Profile from "./pages/Profile";
import Discover from "./pages/Discover";
import More from "./pages/More";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/Admin";
import CreatorDashboard from "./pages/CreatorDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import PaymentSuccess from "./pages/PaymentSuccess";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import PrivateRoute from "./components/PrivateRoute";

// Initialize React Query client outside of component
const queryClient = new QueryClient();

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Routes>
              {/* Make login page the default route */}
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected routes */}
              <Route path="/home" element={<PrivateRoute><Index /></PrivateRoute>} />
              <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
              <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
              <Route path="/collections" element={<PrivateRoute><Collections /></PrivateRoute>} />
              <Route path="/vault" element={<PrivateRoute><Vault /></PrivateRoute>} />
              <Route path="/queue" element={<PrivateRoute><Queue /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/discover" element={<PrivateRoute><Discover /></PrivateRoute>} />
              <Route path="/more" element={<PrivateRoute><More /></PrivateRoute>} />
              
              {/* Payment and subscription success routes */}
              <Route path="/purchase-success" element={<PrivateRoute><PaymentSuccess /></PrivateRoute>} />
              <Route path="/subscription-success" element={<PrivateRoute><SubscriptionSuccess /></PrivateRoute>} />
              <Route path="/purchase-canceled" element={<PrivateRoute><Navigate to="/home" /></PrivateRoute>} />
              <Route path="/subscription-canceled" element={<PrivateRoute><Navigate to="/home" /></PrivateRoute>} />
              
              {/* Admin-only routes */}
              <Route path="/admin" element={
                <PrivateRoute requiredRole="admin"><AdminPanel /></PrivateRoute>
              } />
              
              {/* Creator routes */}
              <Route path="/creator" element={<PrivateRoute><CreatorDashboard /></PrivateRoute>} />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
