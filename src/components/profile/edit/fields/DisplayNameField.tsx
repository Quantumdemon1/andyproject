
import React from "react";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ProfileFormValues } from "../ProfileFormSchema";

interface DisplayNameFieldProps {
  control: Control<ProfileFormValues>;
}

export function DisplayNameField({ control }: DisplayNameFieldProps) {
  return (
    <FormField
      control={control}
      name="displayName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Display Name</FormLabel>
          <FormControl>
            <Input placeholder="Your name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
