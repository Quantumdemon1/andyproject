
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  accountHolderName: z.string().min(2, { message: "Account holder name is required" }),
  accountType: z.enum(["checking", "savings"], { 
    required_error: "Please select an account type" 
  }),
  accountNumber: z.string().min(4, { message: "Account number is required" }),
  routingNumber: z.string().min(9, { message: "Routing number must be 9 digits" }).max(9, { message: "Routing number must be 9 digits" }),
  bankName: z.string().min(2, { message: "Bank name is required" }),
});

type FormValues = z.infer<typeof formSchema>;

const BankAccountForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountHolderName: "",
      accountType: "checking",
      accountNumber: "",
      routingNumber: "",
      bankName: "",
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a bank account",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, you would securely handle this data
      // and use a service like Stripe or Plaid for verification
      
      // For this demo, we'll just store the masked account number
      const last4 = values.accountNumber.slice(-4);
      
      const { error } = await supabase.from("bank_accounts").insert({
        user_id: user.id,
        account_holder_name: values.accountHolderName,
        account_type: values.accountType,
        account_last4: last4,
        bank_name: values.bankName,
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Bank account added",
        description: "Your bank account has been successfully added",
      });
      
      // Reset the form
      form.reset();
    } catch (error) {
      console.error("Error adding bank account:", error);
      toast({
        title: "Error",
        description: "Failed to add bank account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="accountHolderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Holder Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Full name on account" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Bank of America, Wells Fargo, etc." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="accountType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="routingNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Routing Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="9-digit routing number" maxLength={9} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Account number" type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Account...
            </>
          ) : (
            "Add Bank Account"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default BankAccountForm;
