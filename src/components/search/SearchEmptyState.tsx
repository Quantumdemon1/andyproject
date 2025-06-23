
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search as SearchIcon } from 'lucide-react';

interface SearchEmptyStateProps {
  type: 'start' | 'no-results';
  searchQuery?: string;
  contentType?: string;
}

const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({
  type,
  searchQuery,
  contentType
}) => {
  if (type === 'start') {
    return (
      <Card className="bg-gray-900/50 border-white/10">
        <CardContent className="p-8 text-center">
          <SearchIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2 text-white">Start Searching</h3>
          <p className="text-gray-400">Enter at least 3 characters to search for users and posts.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 border-white/10">
      <CardContent className="p-8 text-center">
        <SearchIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2 text-white">No Results Found</h3>
        <p className="text-gray-400">
          No {contentType === 'all' ? 'content' : contentType} found for "{searchQuery}". 
          Try adjusting your search terms or filters.
        </p>
      </CardContent>
    </Card>
  );
};

export default SearchEmptyState;
