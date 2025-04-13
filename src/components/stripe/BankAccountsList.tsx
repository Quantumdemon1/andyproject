
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BankAccount {
  id: string;
  account_holder_name: string;
  account_type: string;
  account_last4: string;
  bank_name: string;
  is_verified: boolean;
  is_primary: boolean;
}

const BankAccountsList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("is_primary", { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error("Error loading bank accounts:", error);
      toast({
        title: "Error",
        description: "Failed to load bank accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const handleSetPrimary = async (accountId: string) => {
    if (!user) return;

    try {
      // Begin transaction by setting all accounts to non-primary
      const { error: resetError } = await supabase
        .from("bank_accounts")
        .update({ is_primary: false })
        .eq("user_id", user.id);

      if (resetError) throw resetError;

      // Then set the selected account as primary
      const { error } = await supabase
        .from("bank_accounts")
        .update({ is_primary: true })
        .eq("id", accountId);

      if (error) throw error;

      // Refresh the list
      fetchAccounts();
      toast({
        title: "Primary account updated",
        description: "Your primary bank account has been updated",
      });
    } catch (error) {
      console.error("Error setting primary account:", error);
      toast({
        title: "Error",
        description: "Failed to update primary account",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("bank_accounts")
        .delete()
        .eq("id", accountId);

      if (error) throw error;

      // Refresh the list
      fetchAccounts();
      toast({
        title: "Account removed",
        description: "Your bank account has been removed",
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to remove bank account",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading bank accounts...</div>;
  }

  if (accounts.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No bank accounts added yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <Card key={account.id} className={account.is_primary ? "border-aura-blue" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <CardTitle className="text-lg">{account.bank_name}</CardTitle>
              </div>
              {account.is_primary && <Badge className="bg-aura-blue">Primary</Badge>}
              {account.is_verified && <Badge className="bg-green-500">Verified</Badge>}
            </div>
            <CardDescription>
              {account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)} •••• {account.account_last4}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{account.account_holder_name}</p>
          </CardContent>
          <CardFooter className="justify-between pt-0">
            {!account.is_primary && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSetPrimary(account.id)}
              >
                Set as Primary
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleDelete(account.id)}
              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default BankAccountsList;
