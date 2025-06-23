
import React, { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Hash } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  onTagsChange,
  placeholder = "Add tags...",
  maxTags = 10,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tagText: string) => {
    const trimmedTag = tagText.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onTagsChange([...tags, trimmedTag]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleInputChange = (value: string) => {
    // Remove # at the beginning if user types it
    const cleanValue = value.replace(/^#/, '');
    setInputValue(cleanValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-gray-400" />
        <p className="text-sm font-medium text-gray-400">
          Tags ({tags.length}/{maxTags})
        </p>
      </div>

      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 bg-aura-blue/20 text-aura-blue border-aura-blue/30"
            >
              #{tag}
              <Button
                onClick={() => removeTag(tag)}
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Tag Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Hash className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length >= maxTags ? `Maximum ${maxTags} tags reached` : placeholder}
          disabled={tags.length >= maxTags}
          className="pl-10"
        />
      </div>

      <p className="text-xs text-gray-500">
        Press Enter or comma to add tags. Use relevant keywords to help others discover your content.
      </p>
    </div>
  );
};

export default TagInput;
