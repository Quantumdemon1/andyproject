
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react"; 
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface TestLoginButtonsProps {
  onTestLogin: (role: 'admin' | 'user') => Promise<void>;
}

const TestLoginButtons: React.FC<TestLoginButtonsProps> = ({
  onTestLogin
}) => {
  const [testAccountLoading, setTestAccountLoading] = useState<'admin' | 'user' | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Function to ensure test accounts exist
  const ensureTestAccountExists = async (email: string, password: string) => {
    try {
      // Try to sign in first to check if account exists
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // If sign in succeeds, the account exists
      if (!signInError) {
        // Sign out to reset the state for clean test login
        await supabase.auth.signOut();
        return;
      }
      
      // If error is not "Invalid login credentials", throw it
      if (signInError.message !== "Invalid login credentials") {
        throw signInError;
      }
      
      // If we get here, account doesn't exist, so create it
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: email.split('@')[0],
          }
        }
      });
      
      if (signUpError) {
        throw signUpError;
      }
      
      // Sign out in case auto-signin happened
      await supabase.auth.signOut();
      
      toast({
        title: "Test account created",
        description: `Created ${email} account successfully.`,
      });
    } catch (error) {
      console.error("Error ensuring test account exists:", error);
      throw error;
    }
  };
  
  const handleTestLogin = async (role: 'admin' | 'user') => {
    try {
      setTestAccountLoading(role);
      
      // For user role, bypass authentication and go directly to home
      if (role === 'user') {
        // Set direct access flag in session storage
        sessionStorage.setItem('direct_access', 'true');
        
        // Display success toast
        toast({
          title: "Login successful",
          description: "You are now logged in as user",
          variant: "default"
        });
        
        // Force navigation to home page with a full page reload
        window.location.href = '/home';
        return;
      }
      
      // For admin, try the standard authentication
      const email = 'admin@example.com';
      const password = 'password123';
      
      // Ensure the account exists
      await ensureTestAccountExists(email, password);
      
      // Now proceed with login
      await onTestLogin(role);
      
      toast({
        title: "Login successful",
        description: `You are now logged in as ${role}`,
        variant: "default"
      });
    } catch (error) {
      console.error("Test login error:", error);
      
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Failed to log in with test account",
        variant: "destructive"
      });
    } finally {
      setTestAccountLoading(null);
    }
  };
  
  return (
    <div className="flex flex-col gap-3 mt-6">
      <Button 
        variant="outline" 
        onClick={() => handleTestLogin('admin')} 
        type="button" 
        disabled={!!testAccountLoading} 
        className="w-full h-12 relative text-zinc-950"
      >
        {testAccountLoading === 'admin' ? (
          <span className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Logging in...
          </span>
        ) : "Login as Admin"}
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => handleTestLogin('user')} 
        type="button" 
        disabled={!!testAccountLoading} 
        className="w-full h-12 relative text-zinc-950"
      >
        {testAccountLoading === 'user' ? (
          <span className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Logging in...
          </span>
        ) : "Login as User"}
      </Button>
    </div>
  );
};

export default TestLoginButtons;
