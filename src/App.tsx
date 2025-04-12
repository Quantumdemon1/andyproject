
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Collections from "./pages/Collections";
import Vault from "./pages/Vault";
import Queue from "./pages/Queue";
import Profile from "./pages/Profile";
import More from "./pages/More";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/queue" element={<Queue />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/more" element={<More />} />
            <Route path="/login" element={<Login />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
