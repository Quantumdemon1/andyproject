import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/MainLayout';
import SearchFilters, { SearchFilterState } from '@/components/search/SearchFilters';
import SearchHeader from '@/components/search/SearchHeader';
import SearchResults from '@/components/search/SearchResults';
import SearchEmptyState from '@/components/search/SearchEmptyState';
import TrendingSidebar from '@/components/search/TrendingSidebar';
import { globalSearch, getTrendingSearches } from '@/api/searchApi';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import SkipLink from '@/components/accessibility/SkipLink';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';

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

  const { isOnline } = useOfflineDetection();
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
    enabled: searchQuery.length > 2 && isOnline,
  });

  const { data: trendingSearches, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending-searches'],
    queryFn: () => getTrendingSearches(15),
    enabled: isOnline,
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
    
    // Apply date filters
    if (filters.dateRange !== 'all') {
      const now = new Date();
      
      if (filters.dateRange === 'custom') {
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
      } else {
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
        }
        
        results = results.filter(r => 
          r.created_at && new Date(r.created_at) >= filterDate
        );
      }
    }
    
    return results;
  }, [searchResults?.results, filters]);

  const totalPages = Math.ceil((searchResults?.total || 0) / RESULTS_PER_PAGE);

  const highlightText = (text: string) => {
    if (!searchQuery || !text) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200/80 text-gray-900 rounded px-1">$1</mark>');
  };

  return (
    <>
      <SkipLink />
      <MainLayout title="Search">
        <div id="main-content" className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <SearchHeader
              onSearch={handleSearch}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isOnline={isOnline}
            />

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
                  <SearchEmptyState type="start" />
                ) : filteredResults.length > 0 ? (
                  <SearchResults
                    results={filteredResults}
                    isLoading={searchLoading}
                    searchQuery={searchQuery}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    highlightText={highlightText}
                  />
                ) : (
                  <SearchEmptyState
                    type="no-results"
                    searchQuery={searchQuery}
                    contentType={filters.contentType}
                  />
                )}
              </div>

              {/* Trending Searches Sidebar */}
              <div className="lg:col-span-1">
                <TrendingSidebar
                  trendingSearches={trendingSearches}
                  isLoading={trendingLoading}
                  onTrendingClick={handleTrendingClick}
                />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default Search;
