
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/MainLayout';
import SearchAutocomplete from '@/components/search/SearchAutocomplete';
import SearchFilters, { SearchFilterState } from '@/components/search/SearchFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, User, FileText } from 'lucide-react';
import { globalSearch, getTrendingSearches, SearchResult } from '@/api/searchApi';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import LazyImage from '@/components/optimization/LazyImage';
import SkipLink from '@/components/accessibility/SkipLink';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<SearchFilterState>({
    contentType: (searchParams.get('type') as 'all' | 'posts' | 'users') || 'all',
    mediaType: 'all',
    dateRange: 'all',
    tags: [],
    verified: false,
    hasMedia: false,
  });

  // Enable real-time updates
  useRealTimeUpdates();

  const { data: searchResults, isLoading: searchLoading, refetch } = useQuery({
    queryKey: ['global-search', searchQuery, filters],
    queryFn: () => globalSearch(searchQuery, filters.contentType),
    enabled: searchQuery.length > 2,
  });

  const { data: trendingSearches, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending-searches'],
    queryFn: () => getTrendingSearches(10),
  });

  useEffect(() => {
    const q = searchParams.get('q');
    const type = searchParams.get('type') as 'all' | 'posts' | 'users';
    if (q) setSearchQuery(q);
    if (type) setFilters(prev => ({ ...prev, contentType: type }));
  }, [searchParams]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 2) {
      setSearchParams({ q: query, type: filters.contentType });
      refetch();
    }
  };

  const handleFiltersChange = (newFilters: SearchFilterState) => {
    setFilters(newFilters);
    if (searchQuery.trim().length > 2) {
      setSearchParams({ q: searchQuery, type: newFilters.contentType });
    }
  };

  const handleTrendingClick = (term: string) => {
    setSearchQuery(term);
    setSearchParams({ q: term, type: filters.contentType });
  };

  const renderSearchResult = (result: SearchResult) => {
    return (
      <Card key={`${result.result_type}-${result.result_id}`} className="mb-4 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              {result.avatar_url ? (
                <LazyImage 
                  src={result.avatar_url} 
                  alt={result.username || 'User avatar'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <AvatarFallback>
                  {result.result_type === 'user' ? (
                    <User className="h-6 w-6" />
                  ) : (
                    <FileText className="h-6 w-6" />
                  )}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant={result.result_type === 'post' ? 'default' : 'secondary'}>
                  {result.result_type === 'post' ? 'Post' : 'User'}
                </Badge>
                {result.username && (
                  <span className="text-sm text-gray-600">@{result.username}</span>
                )}
                {result.created_at && (
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              
              <h3 className="font-semibold text-lg mb-2">{result.title}</h3>
              
              {result.content && (
                <p className="text-gray-700 line-clamp-3">{result.content}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <SkipLink />
      <MainLayout title="Search">
        <div id="main-content" className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Search Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-6">Search</h1>
              
              <SearchAutocomplete
                onSearch={handleSearch}
                onSelect={(result) => {
                  // Handle result selection if needed
                  console.log('Selected result:', result);
                }}
              />

              {/* Search Type Tabs */}
              <Tabs 
                value={filters.contentType} 
                onValueChange={(value) => handleFiltersChange({ ...filters, contentType: value as any })}
                className="mt-4"
              >
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <SearchFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                />
              </div>

              {/* Search Results */}
              <div className="lg:col-span-2">
                {searchQuery.length < 3 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <h3 className="text-lg font-semibold mb-2">Start Searching</h3>
                      <p className="text-gray-600">Enter at least 3 characters to search for users and posts.</p>
                    </CardContent>
                  </Card>
                ) : searchLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
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
                ) : searchResults && searchResults.length > 0 ? (
                  <div>
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold">
                        Search Results ({searchResults.length})
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {searchResults.map(renderSearchResult)}
                    </div>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                      <p className="text-gray-600">
                        No {filters.contentType === 'all' ? 'content' : filters.contentType} found for "{searchQuery}". 
                        Try adjusting your search terms or filters.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Trending Searches Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Trending Searches
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {trendingLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-8" />
                          </div>
                        ))}
                      </div>
                    ) : trendingSearches && trendingSearches.length > 0 ? (
                      <div className="space-y-3">
                        {trendingSearches.map((trend, index) => (
                          <div 
                            key={trend.search_term}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                            onClick={() => handleTrendingClick(trend.search_term)}
                            role="button"
                            tabIndex={0}
                            aria-label={`Search for ${trend.search_term}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleTrendingClick(trend.search_term);
                              }
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-500">
                                {index + 1}.
                              </span>
                              <span className="text-sm">{trend.search_term}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {trend.search_count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">No trending searches yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default Search;
