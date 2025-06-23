
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Palette, Plus } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface CategorySelectorProps {
  selectedCategoryId?: string;
  onCategorySelect: (categoryId: string | null) => void;
  className?: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategoryId,
  onCategorySelect,
  className = ''
}) => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['content-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Category[];
    }
  });

  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <p className="text-sm font-medium text-gray-400">Category</p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-20 bg-white/10 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-gray-400" />
        <p className="text-sm font-medium text-gray-400">Category</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => onCategorySelect(null)}
          variant={selectedCategoryId ? "outline" : "default"}
          size="sm"
          className="h-8"
        >
          All
        </Button>
        
        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            variant={selectedCategoryId === category.id ? "default" : "outline"}
            size="sm"
            className="h-8"
            style={{
              backgroundColor: selectedCategoryId === category.id ? category.color : undefined,
              borderColor: category.color,
              color: selectedCategoryId === category.id ? 'white' : category.color
            }}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
