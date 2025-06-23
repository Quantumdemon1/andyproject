
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import Profile from '@/pages/Profile';
import Messages from '@/pages/Messages';
import Notifications from '@/pages/Notifications';
import Discover from '@/pages/Discover';
import Queue from '@/pages/Queue';
import Vault from '@/pages/Vault';
import Collections from '@/pages/Collections';
import More from '@/pages/More';
import CreatorDashboard from '@/pages/CreatorDashboard';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';
import PrivateRoute from '@/components/PrivateRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryProvider } from '@/contexts/QueryContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import PaymentSuccess from '@/pages/PaymentSuccess';
import SubscriptionSuccess from '@/pages/SubscriptionSuccess';
import Search from '@/pages/Search';

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryProvider>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/profile/:userId?" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
              <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
              <Route path="/discover" element={<PrivateRoute><Discover /></PrivateRoute>} />
              <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
              <Route path="/queue" element={<PrivateRoute><Queue /></PrivateRoute>} />
              <Route path="/vault" element={<PrivateRoute><Vault /></PrivateRoute>} />
              <Route path="/collections" element={<PrivateRoute><Collections /></PrivateRoute>} />
              <Route path="/more" element={<PrivateRoute><More /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><CreatorDashboard /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/subscription-success" element={<SubscriptionSuccess />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </QueryProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
