
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

export async function globalSearch(
  query: string, 
  type: 'all' | 'posts' | 'users' = 'all',
  limit: number = 20,
  offset: number = 0
): Promise<SearchResult[]> {
  try {
    console.log('Performing global search:', { query, type, limit, offset });
    
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

    return data || [];
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
