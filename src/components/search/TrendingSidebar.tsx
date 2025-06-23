
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingSearch } from '@/api/searchApi';

interface TrendingSidebarProps {
  trendingSearches?: TrendingSearch[];
  isLoading: boolean;
  onTrendingClick: (term: string) => void;
}

const TrendingSidebar: React.FC<TrendingSidebarProps> = ({
  trendingSearches,
  isLoading,
  onTrendingClick
}) => {
  return (
    <>
      <Card className="bg-gray-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center text-white text-lg">
            <TrendingUp className="h-5 w-5 mr-2 text-aura-purple" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          ) : trendingSearches && trendingSearches.length > 0 ? (
            <div className="space-y-2">
              {trendingSearches.map((trend, index) => (
                <div 
                  key={trend.search_term}
                  className="flex items-center justify-between cursor-pointer hover:bg-white/5 p-3 rounded-lg transition-all duration-200 group"
                  onClick={() => onTrendingClick(trend.search_term)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Search for ${trend.search_term}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onTrendingClick(trend.search_term);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="text-sm font-medium text-aura-purple flex-shrink-0 w-6">
                      #{index + 1}
                    </span>
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                      {trend.search_term}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs border-white/20 text-gray-400 bg-white/5 ml-2 flex-shrink-0">
                    {trend.search_count}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-500" />
              <p className="text-sm text-gray-400">No trending searches yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Search Tips */}
      <Card className="bg-gray-900/50 border-white/10 mt-4">
        <CardHeader>
          <CardTitle className="text-white text-sm">Search Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-gray-400">• Use quotes for exact phrases</p>
          <p className="text-xs text-gray-400">• Add filters to narrow results</p>
          <p className="text-xs text-gray-400">• Try different keywords</p>
        </CardContent>
      </Card>
    </>
  );
};

export default TrendingSidebar;
