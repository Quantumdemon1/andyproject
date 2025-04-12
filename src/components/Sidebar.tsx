
import React from "react";
import { Link } from "react-router-dom";
import { Home, Bell, MessageSquare, BookMarked, FolderArchive, Calendar, BarChart2, UserCircle, MoreHorizontal, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activePath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activePath }) => {
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Bell, label: "Notifications", path: "/notifications", badge: "99+" },
    { icon: MessageSquare, label: "Messages", path: "/messages", badge: "14" },
    { icon: BookMarked, label: "Collections", path: "/collections" },
    { icon: FolderArchive, label: "Vault", path: "/vault" },
    { icon: Calendar, label: "Queue", path: "/queue" },
    { icon: BarChart2, label: "Statements", path: "/statements" },
    { icon: BarChart2, label: "Statistics", path: "/statistics" },
    { icon: UserCircle, label: "My profile", path: "/profile" },
    { icon: MoreHorizontal, label: "More", path: "/more" },
  ];

  return (
    <div className="w-64 min-h-screen bg-aura-charcoal border-r border-white/10 flex flex-col">
      <div className="p-4">
        <div className="h-12 w-12 rounded-full bg-black mb-6"></div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-white/5",
                activePath === item.path ? "sidebar-active bg-white/5" : "text-gray-400"
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto notification-gradient text-white text-xs px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
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
};

export default Sidebar;
