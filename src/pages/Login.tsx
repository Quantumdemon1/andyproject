
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import TestLoginButtons from "@/components/auth/TestLoginButtons";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cleanupAuthState } from "@/utils/authUtils";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (data: { email: string; password: string }) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      // Navigate to home page
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log in",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (data: { email: string; password: string; username: string }) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
          },
          emailRedirectTo: window.location.origin + '/'
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account created successfully. Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestLogin = async (role: 'admin' | 'user') => {
    setIsSubmitting(true);
    
    try {
      const credentials = role === 'admin' 
        ? { email: 'admin@example.com', password: 'password123' }
        : { email: 'user@example.com', password: 'password123' };

      const { error } = await supabase.auth.signInWithPassword(credentials);

      if (error) throw error;

      toast({
        title: "Login successful",
        description: `You are now logged in as ${role}`,
        variant: "default"
      });

      // Navigate to home page
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Failed to log in with test account",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {isSignup ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignup 
                ? "Sign up to get started with your account" 
                : "Enter your credentials to access your account"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSignup ? (
              <SignupForm onSubmit={handleSignup} isSubmitting={isSubmitting} />
            ) : (
              <LoginForm onSubmit={handleLogin} isSubmitting={isSubmitting} />
            )}
            
            <div className="text-center">
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {isSignup 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Show test login buttons only in development */}
        {import.meta.env.DEV && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Development Tools</CardTitle>
              <CardDescription>
                Quick login options for development and testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestLoginButtons onTestLogin={handleTestLogin} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Login;
