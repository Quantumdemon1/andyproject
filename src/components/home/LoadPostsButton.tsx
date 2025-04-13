
import React from "react";
import { Button } from "@/components/ui/button";

const LoadPostsButton = () => {
  return (
    <div className="mb-6">
      <Button className="w-full bg-gradient-to-r from-aura-blue to-aura-purple hover:from-aura-purple hover:to-aura-blue transition-colors duration-300 text-white py-6">
        LOAD NEW POSTS
      </Button>
    </div>
  );
};

export default LoadPostsButton;
