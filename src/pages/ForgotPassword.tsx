
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        setErrorMessage(error.message);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setSubmitted(true);
        toast({
          title: "Reset link sent",
          description: "If an account exists with that email, you will receive a password reset link.",
        });
      }
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred");
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-aura-darkPurple flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 bg-aura-charcoal p-8 rounded-xl border border-white/10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Reset Your Password</h1>
          <p className="text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-md text-sm">
            {errorMessage}
          </div>
        )}
        
        {!submitted ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="h-12 bg-white/5 border-white/10 pl-10"
              />
            </div>
            
            <Button 
              type="submit" 
              variant="gradient" 
              className="w-full h-12 btn-pulse"
              disabled={isSubmitting || !email}
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
            
            <div className="text-center pt-4">
              <Link to="/login" className="text-aura-blue hover:underline">
                Return to login
              </Link>
            </div>
            
            <div className="pt-4 mt-4 text-center text-sm text-gray-400 border-t border-gray-700">
              <p className="mt-4">For testing purposes, you can use:</p>
              <div className="mt-2 p-3 bg-aura-charcoal/50 rounded-md">
                <p className="mb-1"><span className="text-aura-blue">Admin:</span> admin@example.com / password123</p>
                <p><span className="text-aura-blue">User:</span> user@example.com / password123</p>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <div className="bg-green-500/10 text-green-400 p-4 rounded-md">
              Check your email for the password reset link.
            </div>
            
            <p className="text-gray-400">
              Didn't receive an email? Check your spam folder or
              <button
                onClick={() => setSubmitted(false)}
                className="text-aura-blue hover:underline ml-1"
              >
                try again
              </button>.
            </p>
            
            <Link to="/login">
              <Button 
                variant="outline" 
                className="mt-4 border-white/20 hover:bg-white/5"
              >
                Return to login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
