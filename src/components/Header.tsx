import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Home,
  Compass,
  MessageCircle,
  Bell,
  Clock,
  Shield,
  Bookmark,
  MoreHorizontal,
  LogOut,
  Search,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import Sidebar from './Sidebar';
import SearchCommand from '@/components/search/SearchCommand';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearchShortcut = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setSearchOpen(true);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleSearchShortcut);
    return () => document.removeEventListener('keydown', handleSearchShortcut);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-aura-charcoal border-b border-white/10">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-aura-blue to-aura-purple bg-clip-text text-transparent">
            AURA
          </Link>

          {/* Search Button */}
          <div className="flex-1 max-w-md mx-4">
            <Button
              variant="outline"
              className="w-full justify-start text-gray-400 bg-aura-charcoal border-white/10 hover:bg-white/5"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Search...</span>
              <span className="ml-auto hidden sm:inline text-xs">⌘K</span>
            </Button>
          </div>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar_url || undefined} alt={user?.email || "User Avatar"} />
                    <AvatarFallback>{user?.email ? user.email[0].toUpperCase() : "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mr-2" align="end" forceMount>
                <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)} >
                  <User className="h-4 w-4 mr-2" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="outline">Log In</Button>
            </Link>
          )}
        </div>
      </header>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
};

export default Header;
