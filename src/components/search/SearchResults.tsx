
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { SearchResult } from '@/api/searchApi';
import LazyImage from '@/components/optimization/LazyImage';
import SearchPagination from './SearchPagination';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  highlightText: (text: string) => string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isLoading,
  searchQuery,
  currentPage,
  totalPages,
  onPageChange,
  highlightText
}) => {
  const renderSearchResult = (result: SearchResult) => {
    return (
      <Card key={`${result.result_type}-${result.result_id}`} className="mb-4 hover:shadow-lg transition-all duration-200 bg-gray-900/50 border-white/10 hover:border-white/20">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12 flex-shrink-0">
              {result.avatar_url ? (
                <LazyImage 
                  src={result.avatar_url} 
                  alt={result.username || 'User avatar'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <AvatarFallback className="bg-aura-purple">
                  {result.result_type === 'user' ? (
                    <User className="h-6 w-6" />
                  ) : (
                    <FileText className="h-6 w-6" />
                  )}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant={result.result_type === 'post' ? 'default' : 'secondary'} 
                       className={result.result_type === 'post' ? 'bg-aura-purple hover:bg-aura-purple/80' : ''}>
                  {result.result_type === 'post' ? 'Post' : 'User'}
                </Badge>
                {result.username && (
                  <span className="text-sm text-gray-400">@{result.username}</span>
                )}
                {result.created_at && (
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              
              <h3 className="font-semibold text-lg mb-2 text-white truncate" 
                  dangerouslySetInnerHTML={{ __html: highlightText(result.title) }} />
              
              {result.content && (
                <p className="text-gray-300 line-clamp-3 text-sm leading-relaxed" 
                   dangerouslySetInnerHTML={{ __html: highlightText(result.content) }} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="bg-gray-900/50 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return null; // Handle empty state in parent component
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">
          Search Results ({results.length})
        </h2>
        <SearchPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
      <div className="space-y-4">
        {results.map(renderSearchResult)}
      </div>
    </div>
  );
};

export default SearchResults;
