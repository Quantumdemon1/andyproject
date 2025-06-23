
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import Messages from "@/pages/Messages";
import Notifications from "@/pages/Notifications";
import Search from "@/pages/Search";
import CreatorDashboard from "@/pages/CreatorDashboard";
import Admin from "@/pages/Admin";
import Collections from "@/pages/Collections";
import Queue from "@/pages/Queue";
import Vault from "@/pages/Vault";
import More from "@/pages/More";
import Discover from "@/pages/Discover";
import NotFound from "@/pages/NotFound";
import ForgotPassword from "@/pages/ForgotPassword";
import PaymentSuccess from "@/pages/PaymentSuccess";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import PrivateRoute from "@/components/PrivateRoute";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/subscription-success" element={<SubscriptionSuccess />} />
                <Route path="/" element={<PrivateRoute><Index /></PrivateRoute>} />
                <Route path="/profile/:username" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
                <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
                <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><CreatorDashboard /></PrivateRoute>} />
                <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
                <Route path="/collections" element={<PrivateRoute><Collections /></PrivateRoute>} />
                <Route path="/queue" element={<PrivateRoute><Queue /></PrivateRoute>} />
                <Route path="/vault" element={<PrivateRoute><Vault /></PrivateRoute>} />
                <Route path="/more" element={<PrivateRoute><More /></PrivateRoute>} />
                <Route path="/discover" element={<PrivateRoute><Discover /></PrivateRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
