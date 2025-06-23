
import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  backButton?: boolean;
  searchBar?: boolean;
  icons?: boolean;
  settings?: boolean;
  rightSidebar?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  title, 
  backButton = false, 
  searchBar = false, 
  icons = false, 
  settings = false,
  rightSidebar
}) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen bg-aura-darkPurple text-white">
      <Sidebar activePath={location.pathname} />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <div className={cn(
          "flex flex-1 pt-16", // Add top padding to account for fixed header
          isMobile ? "flex-col" : "flex-row"
        )}>
          <div className={cn(
            "flex-1 p-6", 
            rightSidebar && !isMobile ? "border-r border-white/10" : "",
            isMobile ? "p-4" : ""
          )}>
            {title && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold">{title}</h1>
              </div>
            )}
            {children}
          </div>
          
          {rightSidebar && (
            <div className={cn(
              isMobile ? "w-full p-4 border-t border-white/10" : "w-80 p-6"
            )}>
              {rightSidebar}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
