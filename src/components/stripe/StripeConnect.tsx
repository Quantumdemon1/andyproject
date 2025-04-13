
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";

interface StripeAccountStatus {
  connected: boolean;
  onboarded: boolean;
  accountId?: string;
  accountDetails?: {
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    chargesEnabled: boolean;
  };
}

const StripeConnect = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [accountStatus, setAccountStatus] = useState<StripeAccountStatus | null>(null);

  const checkStripeStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log("Checking Stripe account status...");
      const { data, error } = await supabase.functions.invoke("check-stripe-account", {});

      if (error) {
        console.error("Error checking Stripe account:", error);
        throw error;
      }
      
      console.log("Stripe account status:", data);
      setAccountStatus(data);
    } catch (error) {
      console.error("Error checking Stripe account:", error);
      toast({
        title: "Error",
        description: "Failed to check Stripe account status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkStripeStatus();
    }
  }, [user]);

  const handleConnectStripe = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to connect a Stripe account",
        variant: "destructive",
      });
      return;
    }

    try {
      setConnecting(true);
      console.log("Creating Stripe connect account...");
      const { data, error } = await supabase.functions.invoke("create-stripe-account", {});

      if (error) {
        console.error("Error connecting to Stripe:", error);
        throw error;
      }
      
      if (data?.url) {
        console.log("Redirecting to Stripe connect:", data.url);
        window.location.href = data.url;
      } else {
        throw new Error("Failed to get Stripe connect URL");
      }
    } catch (error) {
      console.error("Error connecting to Stripe:", error);
      toast({
        title: "Error",
        description: "Failed to connect to Stripe",
        variant: "destructive",
      });
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-background">
        <CardContent className="pt-6 flex justify-center items-center min-h-[150px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (accountStatus?.connected && accountStatus?.onboarded) {
    return (
      <Card className="bg-background border-green-500/30">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <CardTitle>Stripe Connected</CardTitle>
          </div>
          <CardDescription>
            Your Stripe account is fully connected and verified
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account ID:</span>
              <span className="font-medium">{accountStatus.accountId?.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payouts Enabled:</span>
              <span className="font-medium text-green-500">
                {accountStatus.accountDetails?.payoutsEnabled ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Charges Enabled:</span>
              <span className="font-medium text-green-500">
                {accountStatus.accountDetails?.chargesEnabled ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={handleConnectStripe} className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            Manage Stripe Account
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (accountStatus?.connected && !accountStatus?.onboarded) {
    return (
      <Card className="bg-background border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-yellow-500">Stripe Setup Incomplete</CardTitle>
          <CardDescription>
            You've started the Stripe connection process but haven't completed all requirements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            To receive payments, you need to complete your Stripe account setup by providing all the required information.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleConnectStripe} className="w-full">
            Complete Stripe Setup
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle>Connect with Stripe</CardTitle>
        <CardDescription>
          Set up payments to sell your artwork and receive subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">
          Connecting your Stripe account allows you to securely receive payments directly to your bank account.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleConnectStripe} disabled={connecting} className="w-full">
          {connecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Connect Stripe Account"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StripeConnect;
