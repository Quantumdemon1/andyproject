
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface LoadPostsButtonProps {
  onClick?: () => void;
}

const LoadPostsButton: React.FC<LoadPostsButtonProps> = ({ onClick }) => {
  return (
    <div className="mb-6">
      <Button 
        onClick={onClick}
        className="w-full bg-gradient-to-r from-aura-blue to-aura-purple hover:from-aura-purple hover:to-aura-blue transition-colors duration-300 text-white py-6 flex items-center justify-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        LOAD NEW POSTS
      </Button>
    </div>
  );
};

export default LoadPostsButton;
