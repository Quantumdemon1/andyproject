
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-aura-darkPurple">
      {/* Left side - Banner */}
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
      
      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 p-6 sm:p-10 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Log in</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                className="h-12 bg-white/5 border-white/10"
              />
            </div>
            
            <div className="space-y-2 relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="h-12 bg-white/5 border-white/10 pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            <Button className="w-full h-12 bg-aura-blue hover:bg-aura-blue/80 text-white">
              LOG IN
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-400 space-y-4">
            <p>
              <Link to="/forgot-password" className="text-aura-blue hover:underline">
                Forgot password?
              </Link>
              {" · "}
              <Link to="/signup" className="text-aura-blue hover:underline">
                Sign up for Aura Canvas
              </Link>
            </p>
            
            <p>
              By logging in and using Aura Canvas, you agree to our Terms of Service and Privacy Policy, and confirm that you are at least 18 years old.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button variant="outline" className="w-full h-12 border-white/20 hover:bg-white/5">
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full h-12 border-white/20 hover:bg-white/5">
              Continue with Apple
            </Button>
            <Button variant="outline" className="w-full h-12 border-white/20 hover:bg-white/5">
              Continue with Twitter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
