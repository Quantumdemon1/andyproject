
import React from "react";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ProfileFormValues } from "../ProfileFormSchema";

interface UsernameFieldProps {
  control: Control<ProfileFormValues>;
}

export function UsernameField({ control }: UsernameFieldProps) {
  return (
    <FormField
      control={control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input placeholder="username" {...field} />
          </FormControl>
          <FormDescription>
            This is your public @username
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
