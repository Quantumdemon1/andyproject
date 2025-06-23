
import React from 'react';
import SearchAutocomplete from '@/components/search/SearchAutocomplete';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchFilterState } from '@/components/search/SearchFilters';

interface SearchHeaderProps {
  onSearch: (query: string) => void;
  filters: SearchFilterState;
  onFiltersChange: (filters: SearchFilterState) => void;
  isOnline: boolean;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  onSearch,
  filters,
  onFiltersChange,
  isOnline
}) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Search</h1>
      
      <SearchAutocomplete
        onSearch={onSearch}
        onSelect={(result) => {
          console.log('Selected result:', result);
        }}
      />

      {/* Search Type Tabs */}
      <Tabs 
        value={filters.contentType} 
        onValueChange={(value) => onFiltersChange({ ...filters, contentType: value as any })}
        className="mt-4"
      >
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-gray-800 border border-white/10">
          <TabsTrigger value="all" className="data-[state=active]:bg-aura-purple data-[state=active]:text-white">All</TabsTrigger>
          <TabsTrigger value="posts" className="data-[state=active]:bg-aura-purple data-[state=active]:text-white">Posts</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-aura-purple data-[state=active]:text-white">Users</TabsTrigger>
        </TabsList>
      </Tabs>

      {!isOnline && (
        <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-200 text-sm">You're currently offline. Search results may be limited.</p>
        </div>
      )}
    </div>
  );
};

export default SearchHeader;
