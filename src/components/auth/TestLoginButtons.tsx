
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react"; 

interface TestLoginButtonsProps {
  onTestLogin: (role: 'admin' | 'user') => Promise<void>;
}

const TestLoginButtons: React.FC<TestLoginButtonsProps> = ({
  onTestLogin
}) => {
  const [testAccountLoading, setTestAccountLoading] = useState<'admin' | 'user' | null>(null);
  const { toast } = useToast();
  
  const handleTestLogin = async (role: 'admin' | 'user') => {
    try {
      setTestAccountLoading(role);
      await onTestLogin(role);
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
