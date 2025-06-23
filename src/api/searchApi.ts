import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface SearchResult {
  result_type: 'post' | 'user';
  result_id: string;
  title: string;
  content: string;
  avatar_url: string | null;
  username: string | null;
  created_at: string | null;
  rank: number;
}

export interface TrendingSearch {
  search_term: string;
  search_count: number;
}

export interface ExtendedSearchFilters {
  contentType?: 'all' | 'posts' | 'users';
  mediaType?: 'all' | 'image' | 'video';
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'custom';
  customStartDate?: Date;
  customEndDate?: Date;
  tags?: string[];
  verified?: boolean;
  hasMedia?: boolean;
}

export async function globalSearch(
  query: string, 
  type: 'all' | 'posts' | 'users' = 'all',
  limit: number = 20,
  offset: number = 0,
  filters?: ExtendedSearchFilters
): Promise<SearchResult[]> {
  try {
    console.log('Performing global search:', { query, type, limit, offset, filters });
    
    const { data, error } = await supabase.rpc('global_search', {
      search_query: query,
      search_type: type,
      limit_count: limit,
      offset_count: offset
    });

    if (error) throw error;

    // Track the search if it's a meaningful query
    if (query.trim().length > 2) {
      await trackSearch(query);
    }

    let results = (data || []).map((item: any): SearchResult => ({
      result_type: item.result_type as 'post' | 'user',
      result_id: item.result_id,
      title: item.title || '',
      content: item.content || '',
      avatar_url: item.avatar_url,
      username: item.username,
      created_at: item.created_at,
      rank: item.rank || 0
    }));

    // Apply client-side filters if provided
    if (filters) {
      results = applyClientFilters(results, filters);
    }

    return results;
  } catch (error) {
    console.error('Error performing global search:', error);
    toast({
      title: 'Search Error',
      description: 'Failed to perform search. Please try again.',
      variant: 'destructive'
    });
    return [];
  }
}

function applyClientFilters(results: SearchResult[], filters: ExtendedSearchFilters): SearchResult[] {
  let filteredResults = [...results];

  // Apply date range filters
  if (filters.dateRange && filters.dateRange !== 'all') {
    const now = new Date();
    let filterDate = new Date();

    if (filters.dateRange === 'custom') {
      if (filters.customStartDate) {
        filteredResults = filteredResults.filter(r => 
          r.created_at && new Date(r.created_at) >= filters.customStartDate!
        );
      }
      if (filters.customEndDate) {
        filteredResults = filteredResults.filter(r => 
          r.created_at && new Date(r.created_at) <= filters.customEndDate!
        );
      }
    } else {
      // Handle other date ranges
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

      filteredResults = filteredResults.filter(r => 
        r.created_at && new Date(r.created_at) >= filterDate
      );
    }
  }

  // Apply tag filters
  if (filters.tags && filters.tags.length > 0) {
    filteredResults = filteredResults.filter(result => {
      const contentLower = (result.content || '').toLowerCase();
      const titleLower = (result.title || '').toLowerCase();
      
      return filters.tags!.some(tag => 
        contentLower.includes(tag.toLowerCase()) || 
        titleLower.includes(tag.toLowerCase())
      );
    });
  }

  // Media type filtering would require backend support for proper implementation
  // For now, we'll just return the filtered results
  
  return filteredResults;
}

export async function trackSearch(searchTerm: string): Promise<void> {
  try {
    await supabase.rpc('track_search', {
      search_term: searchTerm
    });
  } catch (error) {
    console.error('Error tracking search:', error);
    // Don't show error to user for analytics tracking
  }
}

export async function getTrendingSearches(limit: number = 10): Promise<TrendingSearch[]> {
  try {
    const { data, error } = await supabase.rpc('get_trending_searches', {
      limit_count: limit
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching trending searches:', error);
    return [];
  }
}

export async function getSearchSuggestions(query: string): Promise<string[]> {
  try {
    if (query.length < 2) return [];

    // Get suggestions from trending searches
    const trending = await getTrendingSearches(20);
    const suggestions = trending
      .filter(trend => trend.search_term.toLowerCase().includes(query.toLowerCase()))
      .map(trend => trend.search_term)
      .slice(0, 5);

    return suggestions;
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return [];
  }
}
