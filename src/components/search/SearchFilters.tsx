
import React, { useState } from 'react';
import { Filter, Calendar, User, Hash, Image, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';

interface SearchFiltersProps {
  filters: SearchFilterState;
  onFiltersChange: (filters: SearchFilterState) => void;
  onClose?: () => void;
}

export interface SearchFilterState {
  contentType: 'all' | 'posts' | 'users' | 'media';
  mediaType: 'all' | 'image' | 'video';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  customStartDate?: Date;
  customEndDate?: Date;
  tags: string[];
  verified: boolean;
  hasMedia: boolean;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onFiltersChange, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof SearchFilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const addTag = (tag: string) => {
    if (tag && !filters.tags.includes(tag)) {
      updateFilter('tags', [...filters.tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    updateFilter('tags', filters.tags.filter(t => t !== tag));
  };

  const clearFilters = () => {
    onFiltersChange({
      contentType: 'all',
      mediaType: 'all',
      dateRange: 'all',
      tags: [],
      verified: false,
      hasMedia: false,
    });
  };

  const hasActiveFilters = filters.contentType !== 'all' || 
                          filters.mediaType !== 'all' || 
                          filters.dateRange !== 'all' || 
                          filters.tags.length > 0 || 
                          filters.verified || 
                          filters.hasMedia;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-5 w-5 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                Active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Content Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Content Type</label>
          <Select value={filters.contentType} onValueChange={(value) => updateFilter('contentType', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Content</SelectItem>
              <SelectItem value="posts">Posts</SelectItem>
              <SelectItem value="users">Users</SelectItem>
              <SelectItem value="media">Media</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Media Type */}
        {filters.contentType === 'media' && (
          <div>
            <label className="text-sm font-medium mb-2 block">Media Type</label>
            <div className="flex space-x-2">
              <Button
                variant={filters.mediaType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('mediaType', 'all')}
              >
                All
              </Button>
              <Button
                variant={filters.mediaType === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('mediaType', 'image')}
              >
                <Image className="h-4 w-4 mr-1" />
                Images
              </Button>
              <Button
                variant={filters.mediaType === 'video' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('mediaType', 'video')}
              >
                <Video className="h-4 w-4 mr-1" />
                Videos
              </Button>
            </div>
          </div>
        )}

        {isExpanded && (
          <>
            {/* Date Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-gray-600">From</label>
                  <DatePicker
                    date={filters.customStartDate}
                    onDateChange={(date) => updateFilter('customStartDate', date)}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">To</label>
                  <DatePicker
                    date={filters.customEndDate}
                    onDateChange={(date) => updateFilter('customEndDate', date)}
                  />
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {filters.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer">
                    <Hash className="h-3 w-3 mr-1" />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add tag..."
                className="w-full px-3 py-1 text-sm border rounded"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addTag(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={filters.verified}
                  onCheckedChange={(checked) => updateFilter('verified', checked)}
                />
                <label htmlFor="verified" className="text-sm">
                  Verified users only
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasMedia"
                  checked={filters.hasMedia}
                  onCheckedChange={(checked) => updateFilter('hasMedia', checked)}
                />
                <label htmlFor="hasMedia" className="text-sm">
                  Has media attachments
                </label>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
