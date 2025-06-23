
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, BanknoteIcon, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import BankAccountForm from "@/components/stripe/BankAccountForm";
import BankAccountsList from "@/components/stripe/BankAccountsList";
import StripeConnect from "@/components/stripe/StripeConnect";
import EarningsCard from "./EarningsCard";
import { fetchCreatorEarnings, requestPayout, EarningsData } from "@/api/earningsApi";

const PaymentsTab: React.FC = () => {
  const { user } = useAuth();
  const [showBankModal, setShowBankModal] = useState(false);
  const [earnings, setEarnings] = useState<EarningsData>({
    totalRevenue: 0,
    subscriptionRevenue: 0,
    purchaseRevenue: 0,
    monthlyRevenue: 0,
    recentTransactions: [],
    payoutBalance: 0
  });
  const [loading, setLoading] = useState(false);

  const loadEarnings = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const earningsData = await fetchCreatorEarnings(user.id);
      setEarnings(earningsData);
    } catch (error) {
      console.error('Error loading earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, [user?.id]);

  const handleRequestPayout = async (amount: number) => {
    setLoading(true);
    const success = await requestPayout(amount);
    if (success) {
      // Reload earnings after successful payout request
      await loadEarnings();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Earnings Dashboard */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Earnings Dashboard</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadEarnings}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <EarningsCard 
        earnings={earnings} 
        onRequestPayout={handleRequestPayout}
        loading={loading}
      />

      {/* Payment Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Connect with Stripe</CardTitle>
              <CardDescription>
                Set up your payment processing to receive funds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StripeConnect />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Bank Accounts</CardTitle>
                <CardDescription>
                  Manage your connected bank accounts
                </CardDescription>
              </div>
              <Dialog open={showBankModal} onOpenChange={setShowBankModal}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <PlusCircle size={16} className="mr-2" />
                    Add Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Bank Account</DialogTitle>
                    <DialogDescription>
                      Enter your bank account details to receive payments
                    </DialogDescription>
                  </DialogHeader>
                  <BankAccountForm />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <BankAccountsList />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                Your recent payments and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <div className="text-center">
                  <BanknoteIcon size={32} className="mx-auto mb-2 opacity-50" />
                  <p>View detailed transaction history above</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">View all transactions</Button>
              <span className="text-xs text-muted-foreground">Updated just now</span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentsTab;
