
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, User, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { globalSearch } from '@/api/searchApi';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchCommand: React.FC<SearchCommandProps> = ({ open, onOpenChange }) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(search, 300);

  const { data: results } = useQuery({
    queryKey: ['command-search', debouncedSearch],
    queryFn: () => globalSearch(debouncedSearch, 'all', 10),
    enabled: debouncedSearch.length > 2,
  });

  const handleSelect = (resultType: string, resultId: string) => {
    onOpenChange(false);
    if (resultType === 'user') {
      navigate(`/profile/${resultId}`);
    } else if (resultType === 'post') {
      navigate(`/post/${resultId}`);
    }
  };

  const handleViewAllResults = () => {
    onOpenChange(false);
    navigate(`/search?q=${encodeURIComponent(search)}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search users and posts..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          {search.length > 2 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-2">No results found</p>
              <button
                onClick={handleViewAllResults}
                className="text-sm text-blue-600 hover:underline"
              >
                View all search results
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Start typing to search...</p>
          )}
        </CommandEmpty>
        
        {results && results.length > 0 && (
          <>
            <CommandGroup heading="Results">
              {results.slice(0, 8).map((result) => (
                <CommandItem
                  key={`${result.result_type}-${result.result_id}`}
                  onSelect={() => handleSelect(result.result_type, result.result_id)}
                  className="flex items-center space-x-3 p-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={result.avatar_url || undefined} />
                    <AvatarFallback>
                      {result.result_type === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge 
                        variant={result.result_type === 'post' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {result.result_type === 'post' ? 'Post' : 'User'}
                      </Badge>
                      {result.username && (
                        <span className="text-xs text-gray-500">@{result.username}</span>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    {result.content && (
                      <p className="text-xs text-gray-600 truncate">{result.content}</p>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            
            {results.length > 8 && (
              <CommandGroup>
                <CommandItem onSelect={handleViewAllResults} className="text-center">
                  <Search className="h-4 w-4 mr-2" />
                  View all {results.length} results
                </CommandItem>
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default SearchCommand;
