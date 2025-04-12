
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual password reset functionality with Supabase
      // This is just a placeholder for now
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitted(true);
      toast({
        title: "Reset link sent",
        description: "If an account exists with that email, you will receive a password reset link.",
      });
    } catch (error) {
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
            
            <div className="text-center pt-4">
              <Link to="/login" className="text-aura-blue hover:underline">
                Return to login
              </Link>
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
