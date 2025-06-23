
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, BanknoteIcon } from "lucide-react";
import BankAccountForm from "@/components/stripe/BankAccountForm";
import BankAccountsList from "@/components/stripe/BankAccountsList";
import StripeConnect from "@/components/stripe/StripeConnect";

const PaymentsTab: React.FC = () => {
  const [showBankModal, setShowBankModal] = useState(false);

  return (
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
                <p>No transactions yet</p>
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
  );
};

export default PaymentsTab;
