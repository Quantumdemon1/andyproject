import React from "react";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ProfileFormValues } from "../ProfileFormSchema";
interface BioFieldProps {
  control: Control<ProfileFormValues>;
  watch: (name: "bio") => string;
}
export function BioField({
  control,
  watch
}: BioFieldProps) {
  return <FormField control={control} name="bio" render={({
    field
  }) => <FormItem>
          <FormLabel>Bio</FormLabel>
          <FormControl>
            <Textarea placeholder="Tell us about yourself" className="resize-none bg-slate-950" />
          </FormControl>
          <FormDescription>
            {watch("bio")?.length || 0}/300 characters
          </FormDescription>
          <FormMessage />
        </FormItem>} />;
}