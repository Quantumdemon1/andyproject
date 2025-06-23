
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import TestLoginButtons from "@/components/auth/TestLoginButtons";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);

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
            {isSignup ? <SignupForm /> : <LoginForm />}
            
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
              <TestLoginButtons />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Login;
