import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Facebook, Twitter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address"
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters"
  })
});
const signupSchema = z.object({
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
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const {
    signIn,
    signUp
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });
  const signupForm = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      username: ""
    }
  });
  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    try {
      const {
        error
      } = await signIn(data.email, data.password);
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  const handleSignup = async (data: z.infer<typeof signupSchema>) => {
    try {
      const {
        error
      } = await signUp(data.email, data.password);
      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      toast({
        title: "Account created",
        description: "Your account has been created successfully."
      });
      setActiveTab("login");
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  return <div className="flex min-h-screen bg-aura-darkPurple">
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
      
      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 p-6 sm:p-10 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" className="text-lg">Log In</TabsTrigger>
              <TabsTrigger value="signup" className="text-lg">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField control={loginForm.control} name="email" render={({
                  field
                }) => <FormItem>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                          <FormControl>
                            <Input {...field} type="email" placeholder="Email" className="h-12 bg-white/5 border-white/10 pl-10" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>} />
                  
                  <FormField control={loginForm.control} name="password" render={({
                  field
                }) => <FormItem>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                          <FormControl>
                            <Input {...field} type={showPassword ? "text" : "password"} placeholder="Password" className="h-12 bg-white/5 border-white/10 pl-10 pr-10" />
                          </FormControl>
                          <button type="button" className="absolute right-3 top-3 text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>} />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <Label htmlFor="remember" className="text-sm text-gray-400">Remember me</Label>
                    </div>
                    <Link to="/forgot-password" className="text-sm text-aura-blue hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  
                  <Button type="submit" variant="gradient" className="w-full h-12 btn-pulse">
                    LOG IN
                  </Button>
                </form>
              </Form>
              
              <div className="relative flex items-center justify-center mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative px-4 bg-aura-darkPurple text-sm text-gray-400">
                  or continue with
                </div>
              </div>
              
              <div className="flex flex-col gap-3 mt-6">
                <Button variant="outline" className="w-full h-12 btn-pulse text-zinc-950">
                  Continue with Google
                </Button>
                <Button variant="outline" className="w-full h-12 btn-pulse text-zinc-950">
                  <Facebook className="mr-2" size={18} /> Continue with Facebook
                </Button>
                <Button variant="outline" className="w-full h-12 btn-pulse text-zinc-950">
                  <Twitter className="mr-2" size={18} /> Continue with Twitter
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                  <FormField control={signupForm.control} name="username" render={({
                  field
                }) => <FormItem>
                        <div className="relative">
                          <User className="absolute left-3 top-3 text-gray-400" size={18} />
                          <FormControl>
                            <Input {...field} placeholder="Username" className="h-12 bg-white/5 border-white/10 pl-10" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>} />
                  
                  <FormField control={signupForm.control} name="email" render={({
                  field
                }) => <FormItem>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                          <FormControl>
                            <Input {...field} type="email" placeholder="Email" className="h-12 bg-white/5 border-white/10 pl-10" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>} />
                  
                  <FormField control={signupForm.control} name="password" render={({
                  field
                }) => <FormItem>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                          <FormControl>
                            <Input {...field} type={showSignupPassword ? "text" : "password"} placeholder="Password" className="h-12 bg-white/5 border-white/10 pl-10 pr-10" />
                          </FormControl>
                          <button type="button" className="absolute right-3 top-3 text-gray-400" onClick={() => setShowSignupPassword(!showSignupPassword)}>
                            {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>} />
                  
                  <div className="text-sm text-gray-400">
                    By signing up, you agree to our <Link to="/terms" className="text-aura-blue hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-aura-blue hover:underline">Privacy Policy</Link>,
                    and confirm that you are at least 18 years old.
                  </div>
                  
                  <Button type="submit" variant="gradient" className="w-full h-12 btn-pulse">
                    SIGN UP
                  </Button>
                </form>
              </Form>
              
              <div className="relative flex items-center justify-center mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative px-4 bg-aura-darkPurple text-sm text-gray-400">
                  or continue with
                </div>
              </div>
              
              <div className="flex flex-col gap-3 mt-6">
                <Button variant="outline" className="">
                  Continue with Google
                </Button>
                <Button variant="outline" className="w-full h-12 border-white/20 hover:bg-white/5">
                  <Facebook className="mr-2" size={18} /> Continue with Facebook
                </Button>
                <Button variant="outline" className="w-full h-12 border-white/20 hover:bg-white/5">
                  <Twitter className="mr-2" size={18} /> Continue with Twitter
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>;
};
export default Login;