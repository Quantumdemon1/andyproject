
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const signupSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address"
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters"
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters"
  })
});

interface SignupFormProps {
  onSubmit: (data: z.infer<typeof signupSchema>) => Promise<void>;
  isSubmitting: boolean;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSubmit, isSubmitting }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      username: ""
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField 
          control={form.control} 
          name="username" 
          render={({ field }) => (
            <FormItem>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Username" 
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
        
        <div className="text-sm text-gray-400">
          By signing up, you agree to our <Link to="/terms" className="text-aura-blue hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-aura-blue hover:underline">Privacy Policy</Link>,
          and confirm that you are at least 18 years old.
        </div>
        
        <Button 
          type="submit" 
          variant="gradient" 
          className="w-full h-12 btn-pulse" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing Up..." : "SIGN UP"}
        </Button>
      </form>
    </Form>
  );
};

export default SignupForm;
