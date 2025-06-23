
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/MainLayout';
import SearchAutocomplete from '@/components/search/SearchAutocomplete';
import SearchFilters, { SearchFilterState } from '@/components/search/SearchFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TrendingUp, User, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { globalSearch, getTrendingSearches, SearchResult } from '@/api/searchApi';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import LazyImage from '@/components/optimization/LazyImage';
import SkipLink from '@/components/accessibility/SkipLink';

const RESULTS_PER_PAGE = 10;

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilterState>({
    contentType: (searchParams.get('type') as 'all' | 'posts' | 'users') || 'all',
    mediaType: 'all',
    dateRange: 'all',
    tags: [],
    verified: false,
    hasMedia: false,
  });

  useRealTimeUpdates();

  const { data: searchResults, isLoading: searchLoading, refetch } = useQuery({
    queryKey: ['global-search', searchQuery, filters, currentPage],
    queryFn: () => {
      if (searchQuery.length < 3) return { results: [], total: 0 };
      
      const offset = (currentPage - 1) * RESULTS_PER_PAGE;
      return globalSearch(searchQuery, filters.contentType, RESULTS_PER_PAGE, offset).then(results => ({
        results,
        total: results.length === RESULTS_PER_PAGE ? offset + RESULTS_PER_PAGE + 1 : offset + results.length
      }));
    },
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
    setCurrentPage(1);
    if (query.trim().length > 2) {
      setSearchParams({ q: query, type: filters.contentType });
      refetch();
    }
  };

  const handleFiltersChange = (newFilters: SearchFilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
    if (searchQuery.trim().length > 2) {
      setSearchParams({ q: searchQuery, type: newFilters.contentType });
    }
  };

  const handleTrendingClick = (term: string) => {
    setSearchQuery(term);
    setCurrentPage(1);
    setSearchParams({ q: term, type: filters.contentType });
  };

  const filteredResults = useMemo(() => {
    if (!searchResults?.results) return [];
    
    let results = [...searchResults.results];
    
    // Apply media filters
    if (filters.mediaType !== 'all' && filters.contentType === 'posts') {
      // This would need backend support for proper filtering
      // For now, we'll just show all results
    }
    
    // Apply date filters
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'custom':
          if (filters.customStartDate) {
            results = results.filter(r => 
              r.created_at && new Date(r.created_at) >= filters.customStartDate!
            );
          }
          if (filters.customEndDate) {
            results = results.filter(r => 
              r.created_at && new Date(r.created_at) <= filters.customEndDate!
            );
          }
          return results;
      }
      
      if (filters.dateRange !== 'custom') {
        results = results.filter(r => 
          r.created_at && new Date(r.created_at) >= filterDate
        );
      }
    }
    
    return results;
  }, [searchResults?.results, filters]);

  const totalPages = Math.ceil((searchResults?.total || 0) / RESULTS_PER_PAGE);

  const renderSearchResult = (result: SearchResult) => {
    const highlightText = (text: string) => {
      if (!searchQuery) return text;
      const regex = new RegExp(`(${searchQuery})`, 'gi');
      return text.replace(regex, '<mark class="bg-yellow-200 text-black">$1</mark>');
    };

    return (
      <Card key={`${result.result_type}-${result.result_id}`} className="mb-4 hover:shadow-lg transition-shadow bg-gray-900/50 border-white/10">
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
                <AvatarFallback className="bg-aura-purple">
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
                <Badge variant={result.result_type === 'post' ? 'default' : 'secondary'} 
                       className={result.result_type === 'post' ? 'bg-aura-purple' : ''}>
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
              
              <h3 className="font-semibold text-lg mb-2 text-white" 
                  dangerouslySetInnerHTML={{ __html: highlightText(result.title) }} />
              
              {result.content && (
                <p className="text-gray-300 line-clamp-3" 
                   dangerouslySetInnerHTML={{ __html: highlightText(result.content) }} />
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
          <div className="max-w-6xl mx-auto">
            {/* Search Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-6 text-white">Search</h1>
              
              <SearchAutocomplete
                onSearch={handleSearch}
                onSelect={(result) => {
                  console.log('Selected result:', result);
                }}
              />

              {/* Search Type Tabs */}
              <Tabs 
                value={filters.contentType} 
                onValueChange={(value) => handleFiltersChange({ ...filters, contentType: value as any })}
                className="mt-4"
              >
                <TabsList className="grid w-full grid-cols-3 max-w-md bg-gray-800">
                  <TabsTrigger value="all" className="data-[state=active]:bg-aura-purple">All</TabsTrigger>
                  <TabsTrigger value="posts" className="data-[state=active]:bg-aura-purple">Posts</TabsTrigger>
                  <TabsTrigger value="users" className="data-[state=active]:bg-aura-purple">Users</TabsTrigger>
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
                  <Card className="bg-gray-900/50 border-white/10">
                    <CardContent className="p-8 text-center">
                      <h3 className="text-lg font-semibold mb-2 text-white">Start Searching</h3>
                      <p className="text-gray-400">Enter at least 3 characters to search for users and posts.</p>
                    </CardContent>
                  </Card>
                ) : searchLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Card key={i} className="bg-gray-900/50 border-white/10">
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
                ) : filteredResults.length > 0 ? (
                  <div>
                    <div className="mb-4 flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-white">
                        Search Results ({filteredResults.length})
                      </h2>
                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="border-white/20"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-gray-400">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="border-white/20"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      {filteredResults.map(renderSearchResult)}
                    </div>
                  </div>
                ) : (
                  <Card className="bg-gray-900/50 border-white/10">
                    <CardContent className="p-8 text-center">
                      <h3 className="text-lg font-semibold mb-2 text-white">No Results Found</h3>
                      <p className="text-gray-400">
                        No {filters.contentType === 'all' ? 'content' : filters.contentType} found for "{searchQuery}". 
                        Try adjusting your search terms or filters.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Trending Searches Sidebar */}
              <div className="lg:col-span-1">
                <Card className="bg-gray-900/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
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
                            className="flex items-center justify-between cursor-pointer hover:bg-white/5 p-2 rounded transition-colors"
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
                              <span className="text-sm text-gray-300">{trend.search_term}</span>
                            </div>
                            <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                              {trend.search_count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No trending searches yet.</p>
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
