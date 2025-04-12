
import React, { useState } from "react";
import { Control, useController } from "react-hook-form";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileFormValues } from "../ProfileFormSchema";

interface TagsFieldProps {
  control: Control<ProfileFormValues>;
}

export function TagsField({ control }: TagsFieldProps) {
  const { field } = useController({ name: "tags", control });
  
  const [tags, setTags] = useState<string[]>(
    field.value ? field.value.split(',') : []
  );
  
  const [newTag, setNewTag] = useState<string>("");

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      field.onChange(updatedTags.join(','));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    field.onChange(updatedTags.join(','));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div>
      <FormLabel>Tags</FormLabel>
      <div className="flex items-center gap-2 mt-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a tag"
          className="flex-1"
        />
        <Button 
          type="button" 
          onClick={addTag}
          variant="outline"
        >
          Add
        </Button>
      </div>
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="outline"
              className="px-3 py-1 bg-aura-charcoal"
            >
              {tag}
              <button 
                type="button"
                className="ml-2 text-gray-400 hover:text-gray-200"
                onClick={() => removeTag(tag)}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
