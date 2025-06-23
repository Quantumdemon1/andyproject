
import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { globalSearch } from '@/api/searchApi';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchAutocompleteProps {
  onSearch: (query: string) => void;
  onSelect?: (result: any) => void;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({ onSearch, onSelect }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('search-history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: suggestions } = useQuery({
    queryKey: ['search-autocomplete', debouncedQuery],
    queryFn: () => globalSearch(debouncedQuery, 'all', 5),
    enabled: debouncedQuery.length > 2,
  });

  const trendingSearches = ['digital art', 'photography', 'tutorials', 'inspiration'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      // Add to search history
      const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('search-history', JSON.stringify(newHistory));
      
      onSearch(searchQuery);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (text: string) => {
    setQuery(text);
    handleSearch(text);
  };

  return (
    <div className="relative w-full max-w-2xl" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for content, creators, or topics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-4 py-2 w-full"
        />
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {/* Search History */}
            {query.length === 0 && searchHistory.length > 0 && (
              <div className="p-3 border-b">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Clock className="h-4 w-4 mr-2" />
                  Recent searches
                </div>
                <div className="space-y-1">
                  {searchHistory.slice(0, 5).map((historyItem, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(historyItem)}
                      className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                    >
                      {historyItem}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            {query.length === 0 && (
              <div className="p-3 border-b">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((trend, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSelectSuggestion(trend)}
                    >
                      {trend}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Search Suggestions */}
            {suggestions && suggestions.length > 0 && (
              <div className="p-3">
                <div className="text-sm text-gray-600 mb-2">Suggestions</div>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleSelectSuggestion(suggestion.title);
                        onSelect?.(suggestion);
                      }}
                      className="block w-full text-left px-2 py-2 hover:bg-gray-100 rounded"
                    >
                      <div className="font-medium text-sm">{suggestion.title}</div>
                      {suggestion.content && (
                        <div className="text-xs text-gray-600 truncate">
                          {suggestion.content}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {query.length > 2 && (!suggestions || suggestions.length === 0) && (
              <div className="p-3 text-center text-gray-500 text-sm">
                No suggestions found
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchAutocomplete;
