
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address"
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters"
  })
});

interface LoginFormProps {
  onSubmit: (data: z.infer<typeof loginSchema>) => Promise<void>;
  isSubmitting: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isSubmitting }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField 
          control={form.control} 
          name="email" 
          render={({ field }) => (
            <FormItem>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <FormControl>
                  <Input 
                    {...field} 
                    type="email" 
                    placeholder="Email" 
                    className="h-12 bg-white/5 border-white/10 pl-10" 
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )} 
        />
        
        <FormField 
          control={form.control} 
          name="password" 
          render={({ field }) => (
            <FormItem>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <FormControl>
                  <Input 
                    {...field} 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    className="h-12 bg-white/5 border-white/10 pl-10 pr-10" 
                  />
                </FormControl>
                <button 
                  type="button" 
                  className="absolute right-3 top-3 text-gray-400" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )} 
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember" className="text-sm text-gray-400">Remember me</Label>
          </div>
          <Link to="/forgot-password" className="text-sm text-aura-blue hover:underline">
            Forgot password?
          </Link>
        </div>
        
        <Button 
          type="submit" 
          variant="gradient" 
          className="w-full h-12 btn-pulse" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing In..." : "LOG IN"}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
