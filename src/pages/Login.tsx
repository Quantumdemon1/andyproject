
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import LoginForm, { loginSchema } from "@/components/auth/LoginForm";
import SignupForm, { signupSchema } from "@/components/auth/SignupForm";
import TestLoginButtons from "@/components/auth/TestLoginButtons";
import AccountInfo from "@/components/auth/AccountInfo";

const Login = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      // No need to navigate here, as the auth state change will trigger the useEffect
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (data: z.infer<typeof signupSchema>) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      const { error } = await signUp(data.email, data.password, data.username);
      
      if (error) {
        setErrorMessage(error.message);
        return;
      }

      // Automatically switch to login tab after successful signup
      setActiveTab("login");
      toast({
        title: "Account created successfully",
        description: "You can now log in with your credentials",
      });
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestLogin = async (role: 'admin' | 'user') => {
    setErrorMessage(null);
    
    try {
      const email = role === 'admin' ? 'admin@example.com' : 'user@example.com';
      const password = 'password123';
      
      const { error } = await signIn(email, password);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Success toast and navigation is handled in the AuthContext and useEffect
    } catch (error: any) {
      throw error; // Let the TestLoginButtons component handle the error
    }
  };

  return (
    <div className="flex min-h-screen bg-aura-darkPurple">
      <div className="hidden lg:flex lg:flex-1 bg-aura-blue relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-aura-blue/80 to-purple-800/90"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
          <h1 className="text-4xl font-bold mb-4 text-white">Sign up to support your favorite creators</h1>
          <div className="w-2/3 opacity-50">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path fill="currentColor" d="M40.9,-68.5C52.9,-62.1,62.4,-50.7,70.1,-38.1C77.8,-25.5,83.7,-12.7,81.9,-1.1C80.2,10.6,70.7,21.2,62.8,32.9C54.9,44.6,48.6,57.5,38.4,67.3C28.1,77.1,14.1,84,1.7,81.6C-10.6,79.2,-21.2,67.5,-31.8,58.2C-42.5,48.9,-53.2,42,-63,32.1C-72.8,22.3,-81.7,9.6,-82.7,-4C-83.7,-17.5,-76.8,-31.1,-67.1,-41.7C-57.3,-52.3,-44.8,-60.1,-32.1,-66.1C-19.3,-72.1,-6.4,-76.2,6,-80.6C18.5,-85,37,-80.6,40.9,-68.5Z" transform="translate(100 100)" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="w-full lg:w-1/2 p-6 sm:p-10 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-md text-sm">
              {errorMessage}
            </div>
          )}
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" className="text-lg">Log In</TabsTrigger>
              <TabsTrigger value="signup" className="text-lg">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <LoginForm onSubmit={handleLogin} isSubmitting={isSubmitting} />
              
              <div className="relative flex items-center justify-center mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative px-4 bg-aura-darkPurple text-sm text-gray-400">
                  quick access
                </div>
              </div>
              
              <TestLoginButtons onTestLogin={handleTestLogin} />
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <SignupForm onSubmit={handleSignup} isSubmitting={isSubmitting} />
              <AccountInfo />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Login;
