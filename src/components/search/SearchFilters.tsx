
import React, { useState } from 'react';
import { Filter, Calendar, User, Hash, Image, Video, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';

interface SearchFiltersProps {
  filters: SearchFilterState;
  onFiltersChange: (filters: SearchFilterState) => void;
  onClose?: () => void;
}

export interface SearchFilterState {
  contentType: 'all' | 'posts' | 'users';
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
  const [tagInput, setTagInput] = useState('');

  const updateFilter = (key: keyof SearchFilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const addTag = (tag: string) => {
    const cleanTag = tag.trim().replace(/^#/, '');
    if (cleanTag && !filters.tags.includes(cleanTag)) {
      updateFilter('tags', [...filters.tags, cleanTag]);
      setTagInput('');
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  return (
    <Card className="w-full bg-gray-900/50 border-white/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg text-white">
            <Filter className="h-5 w-5 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 bg-aura-purple/20 text-aura-purple">
                Active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-400 hover:text-white">
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white"
            >
              {isExpanded ? 'Less' : 'More'}
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Content Type */}
        <div>
          <label className="text-sm font-medium mb-2 block text-gray-300">Content Type</label>
          <Select value={filters.contentType} onValueChange={(value) => updateFilter('contentType', value)}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Content</SelectItem>
              <SelectItem value="posts">Posts</SelectItem>
              <SelectItem value="users">Users</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isExpanded && (
          <>
            {/* Media Type Filter */}
            {filters.contentType !== 'users' && (
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-300">Media Type</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filters.mediaType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateFilter('mediaType', 'all')}
                    className={filters.mediaType === 'all' ? 'bg-aura-purple' : 'border-white/20 text-gray-300'}
                  >
                    All
                  </Button>
                  <Button
                    variant={filters.mediaType === 'image' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateFilter('mediaType', 'image')}
                    className={filters.mediaType === 'image' ? 'bg-aura-purple' : 'border-white/20 text-gray-300'}
                  >
                    <Image className="h-4 w-4 mr-1" />
                    Images
                  </Button>
                  <Button
                    variant={filters.mediaType === 'video' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateFilter('mediaType', 'video')}
                    className={filters.mediaType === 'video' ? 'bg-aura-purple' : 'border-white/20 text-gray-300'}
                  >
                    <Video className="h-4 w-4 mr-1" />
                    Videos
                  </Button>
                </div>
              </div>
            )}

            {/* Date Range */}
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-300">Date Range</label>
              <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
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
                  <label className="text-sm text-gray-400">From</label>
                  <DatePicker
                    date={filters.customStartDate}
                    onDateChange={(date) => updateFilter('customStartDate', date)}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">To</label>
                  <DatePicker
                    date={filters.customEndDate}
                    onDateChange={(date) => updateFilter('customEndDate', date)}
                  />
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-300">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {filters.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-aura-purple/20 text-aura-purple cursor-pointer hover:bg-aura-purple/30">
                    <Hash className="h-3 w-3 mr-1" />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-aura-purple hover:text-red-400"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                type="text"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-white/5 border-white/10 text-white placeholder-gray-400"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={filters.verified}
                  onCheckedChange={(checked) => updateFilter('verified', checked)}
                />
                <label htmlFor="verified" className="text-sm text-gray-300">
                  Verified users only
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasMedia"
                  checked={filters.hasMedia}
                  onCheckedChange={(checked) => updateFilter('hasMedia', checked)}
                />
                <label htmlFor="hasMedia" className="text-sm text-gray-300">
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
