import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
interface TestLoginButtonsProps {
  onTestLogin: (role: 'admin' | 'user') => Promise<void>;
}
const TestLoginButtons: React.FC<TestLoginButtonsProps> = ({
  onTestLogin
}) => {
  const [testAccountLoading, setTestAccountLoading] = useState<'admin' | 'user' | null>(null);
  const {
    toast
  } = useToast();
  const handleTestLogin = async (role: 'admin' | 'user') => {
    try {
      setTestAccountLoading(role);
      await onTestLogin(role);
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Failed to log in with test account",
        variant: "destructive"
      });
    } finally {
      setTestAccountLoading(null);
    }
  };
  return <div className="flex flex-col gap-3 mt-6">
      <Button variant="outline" onClick={() => handleTestLogin('admin')} type="button" disabled={!!testAccountLoading} className="w-full h-12 btn-pulse relative text-zinc-950">
        {testAccountLoading === 'admin' ? <span className="flex items-center">
            <span className="h-4 w-4 mr-2 rounded-full border-2 border-t-transparent border-white animate-spin"></span>
            Logging in...
          </span> : "Login as Admin"}
      </Button>
      <Button variant="outline" onClick={() => handleTestLogin('user')} type="button" disabled={!!testAccountLoading} className="w-full h-12 btn-pulse relative text-zinc-950">
        {testAccountLoading === 'user' ? <span className="flex items-center">
            <span className="h-4 w-4 mr-2 rounded-full border-2 border-t-transparent border-white animate-spin"></span>
            Logging in...
          </span> : "Login as User"}
      </Button>
    </div>;
};
export default TestLoginButtons;