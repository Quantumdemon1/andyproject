
import React from "react";
import { Search, Calendar, Image, MessageSquare, PlusCircle, ArrowLeft, Settings, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  title: string;
  backButton?: boolean;
  searchBar?: boolean;
  icons?: boolean;
  settings?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  backButton = false, 
  searchBar = false, 
  icons = false, 
  settings = false 
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={`border-b border-white/10 flex items-center justify-between ${isMobile ? 'h-14 px-4' : 'h-16 px-6'}`}>
      <div className="flex items-center gap-4">
        {backButton && (
          <button className="text-white hover:text-aura-blue transition-colors">
            <ArrowLeft size={22} />
          </button>
        )}
        <h1 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>{title}</h1>
      </div>
      
      <div className="flex items-center gap-3">
        {searchBar && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              className="pl-10 w-[300px] bg-white/5 border-white/10 focus:border-aura-blue"
              placeholder="Search..."
            />
          </div>
        )}
        
        {icons && (
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white">
              <Calendar size={20} />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Image size={20} />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Search size={20} />
            </button>
            <button className="text-gray-400 hover:text-white">
              <PlusCircle size={20} />
            </button>
          </div>
        )}
        
        {isMobile && !searchBar && (
          <Button variant="ghost" size="sm">
            <Search size={18} />
          </Button>
        )}
        
        {settings && (
          <button className="text-gray-400 hover:text-white">
            <Settings size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
