
import React, { useState } from 'react';
import { Search, Bell, MessageCircle, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SearchCommand from './search/SearchCommand';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  searchBar?: boolean;
  icons?: boolean;
}

const Header: React.FC<HeaderProps> = ({ searchBar = true, icons = true }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <span className="font-bold text-xl bg-gradient-to-r from-aura-blue to-aura-purple bg-clip-text text-transparent">
            AURA
          </span>
        </div>

        {searchBar && (
          <div className="flex-1 mx-4">
            <div className="relative max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8"
                onClick={() => setIsSearchOpen(true)}
                readOnly
              />
            </div>
            <SearchCommand open={isSearchOpen} onOpenChange={setIsSearchOpen} />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          {icons && (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>

              <Button variant="ghost" size="icon" className="relative">
                <MessageCircle className="h-5 w-5" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                  2
                </Badge>
              </Button>

              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
