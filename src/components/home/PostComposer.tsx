
import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Image, Video, Mic, FileText, ListTodo, Tag, AtSign, Type } from "lucide-react";

const PostComposer = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="mb-6">
      <Input 
        className={cn(
          "bg-white/5 border-white/10 focus:border-aura-blue placeholder:text-gray-500",
          isMobile ? "p-4 text-base" : "p-6 text-lg"
        )} 
        placeholder="Compose new post..." 
      />
      
      <div className={cn(
        "flex items-center gap-4 mt-4 text-gray-400",
        isMobile ? "overflow-x-auto pb-2" : ""
      )}>
        <button className="hover:text-white flex-shrink-0">
          <Image size={isMobile ? 20 : 24} />
        </button>
        <button className="hover:text-white flex-shrink-0">
          <Video size={isMobile ? 20 : 24} />
        </button>
        <button className="hover:text-white flex-shrink-0">
          <Mic size={isMobile ? 20 : 24} />
        </button>
        {!isMobile && (
          <>
            <button className="hover:text-white flex-shrink-0">
              <FileText size={24} />
            </button>
            <button className="hover:text-white flex-shrink-0">
              <ListTodo size={24} />
            </button>
            <button className="hover:text-white flex-shrink-0">
              <Tag size={24} />
            </button>
            <button className="hover:text-white flex-shrink-0">
              <AtSign size={24} />
            </button>
            <button className="hover:text-white flex-shrink-0">
              <Type size={24} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PostComposer;
