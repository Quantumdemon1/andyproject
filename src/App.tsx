
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
import PrivateRoute from "./components/PrivateRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            
            {/* Admin-only routes */}
            <Route path="/admin" element={
              <PrivateRoute requiredRole="admin"><AdminPanel /></PrivateRoute>
            } />
            
            {/* Creator routes */}
            <Route path="/creator" element={<PrivateRoute><CreatorDashboard /></PrivateRoute>} />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
