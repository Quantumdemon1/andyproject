
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileFormSchema, ProfileFormValues } from "./ProfileFormSchema";
import { DisplayNameField } from "./fields/DisplayNameField";
import { UsernameField } from "./fields/UsernameField";
import { BioField } from "./fields/BioField";
import { TagsField } from "./fields/TagsField";

interface ProfileEditFormProps {
  defaultValues: ProfileFormValues;
  onSuccess: () => void;
  onCancel: () => void;
  onProfileUpdate?: (updatedProfile: any) => void;
}

export function ProfileEditForm({ defaultValues, onSuccess, onCancel, onProfileUpdate }: ProfileEditFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues,
  });

  async function onSubmit(values: ProfileFormValues) {
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      // Optimistic update - update UI immediately
      if (onProfileUpdate) {
        onProfileUpdate({
          username: values.username,
          display_name: values.displayName,
          bio: values.bio,
          tags: values.tags,
        });
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          username: values.username,
          display_name: values.displayName,
          bio: values.bio,
          tags: values.tags,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Revert optimistic update on error
      if (onProfileUpdate) {
        onProfileUpdate({
          username: defaultValues.username,
          display_name: defaultValues.displayName,
          bio: defaultValues.bio,
          tags: defaultValues.tags,
        });
      }
      
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <DisplayNameField control={form.control} />
        <UsernameField control={form.control} />
        <BioField control={form.control} watch={form.watch} />
        <TagsField control={form.control} />
        
        <div className="flex justify-end gap-3 pt-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="gradient"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
