import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Bell, MessageSquare, BookMarked, FolderArchive, Calendar, UserCircle, MoreHorizontal, PlusCircle, Menu, X, Search, Compass, MessageCircle, Clock, Shield, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  activePath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activePath }) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  
  const navigationItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Compass, label: 'Discover', path: '/discover' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Clock, label: 'Queue', path: '/queue' },
    { icon: Shield, label: 'Vault', path: '/vault' },
    { icon: Bookmark, label: 'Collections', path: '/collections' },
    { icon: MoreHorizontal, label: 'More', path: '/more' },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // If on mobile and sidebar is closed, render only the toggle button
  if (isMobile && !isOpen) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="fixed top-4 left-4 z-50 bg-aura-charcoal/80 backdrop-blur-sm"
        onClick={toggleSidebar}
      >
        <Menu size={24} />
      </Button>
    );
  }

  const sidebarContent = (
    <div className={cn(
      "flex flex-col",
      isMobile ? "w-full h-full" : "min-h-screen"
    )}>
      <div className="p-4">
        {isMobile && (
          <div className="flex justify-between items-center mb-6">
            <div className="h-12 w-12 rounded-full bg-black"></div>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X size={24} />
            </Button>
          </div>
        )}
        
        {!isMobile && (
          <div className="h-12 w-12 rounded-full bg-black mb-6"></div>
        )}
        
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={isMobile ? toggleSidebar : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-white/5",
                activePath === item.path ? "sidebar-active bg-white/5" : "text-gray-400"
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.badge && (
                <Badge variant="notification" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-4">
        <Button variant="gradient" className="w-full btn-pulse text-white flex items-center gap-2">
          <PlusCircle size={18} />
          NEW POST
        </Button>
      </div>
    </div>
  );

  // Render the sidebar content with appropriate styling based on device type
  return (
    <>
      {isMobile ? (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-aura-charcoal border-r border-white/10">
            {sidebarContent}
          </div>
        </div>
      ) : (
        <div className="w-64 bg-aura-charcoal border-r border-white/10">
          {sidebarContent}
        </div>
      )}
    </>
  );
};

export default Sidebar;
