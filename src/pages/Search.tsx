
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search as SearchIcon, TrendingUp, User, FileText } from 'lucide-react';
import { globalSearch, getTrendingSearches, SearchResult } from '@/api/searchApi';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState<'all' | 'posts' | 'users'>(
    (searchParams.get('type') as 'all' | 'posts' | 'users') || 'all'
  );

  const { data: searchResults, isLoading: searchLoading, refetch } = useQuery({
    queryKey: ['global-search', searchQuery, searchType],
    queryFn: () => globalSearch(searchQuery, searchType),
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
    if (type) setSearchType(type);
  }, [searchParams]);

  const handleSearch = () => {
    if (searchQuery.trim().length > 2) {
      setSearchParams({ q: searchQuery, type: searchType });
      refetch();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTrendingClick = (term: string) => {
    setSearchQuery(term);
    setSearchParams({ q: term, type: searchType });
  };

  const handleTypeChange = (value: string) => {
    const newType = value as 'all' | 'posts' | 'users';
    setSearchType(newType);
    if (searchQuery.trim().length > 2) {
      setSearchParams({ q: searchQuery, type: newType });
    }
  };

  const renderSearchResult = (result: SearchResult) => {
    return (
      <Card key={`${result.result_type}-${result.result_id}`} className="mb-4 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={result.avatar_url || undefined} />
              <AvatarFallback>
                {result.result_type === 'user' ? (
                  <User className="h-6 w-6" />
                ) : (
                  <FileText className="h-6 w-6" />
                )}
              </AvatarFallback>
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
    <MainLayout title="Search">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-6">Search</h1>
            
            <div className="flex space-x-2 mb-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search for users, posts, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={searchQuery.trim().length < 3}>
                Search
              </Button>
            </div>

            {/* Search Type Tabs */}
            <Tabs value={searchType} onValueChange={handleTypeChange}>
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Search Results */}
            <div className="lg:col-span-2">
              {searchQuery.length < 3 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                    <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                    <p className="text-gray-600">
                      No {searchType === 'all' ? 'content' : searchType} found for "{searchQuery}". 
                      Try adjusting your search terms.
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
                          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded"
                          onClick={() => handleTrendingClick(trend.search_term)}
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
  );
};

export default Search;
