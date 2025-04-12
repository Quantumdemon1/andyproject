
import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
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
  
  return (
    <div className="flex min-h-screen bg-aura-darkPurple text-white">
      <Sidebar activePath={location.pathname} />
      
      <div className="flex-1 flex flex-col">
        <Header 
          title={title} 
          backButton={backButton} 
          searchBar={searchBar} 
          icons={icons} 
          settings={settings}
        />
        
        <div className="flex flex-1">
          <div className={`flex-1 p-6 ${rightSidebar ? 'border-r border-white/10' : ''}`}>
            {children}
          </div>
          
          {rightSidebar && (
            <div className="w-80 p-6">
              {rightSidebar}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
