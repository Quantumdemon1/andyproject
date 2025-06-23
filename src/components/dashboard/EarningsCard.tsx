
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Calendar, CreditCard } from "lucide-react";
import { EarningsData, Transaction } from "@/api/earningsApi";

interface EarningsCardProps {
  earnings: EarningsData;
  onRequestPayout: (amount: number) => void;
  loading?: boolean;
}

const EarningsCard: React.FC<EarningsCardProps> = ({ earnings, onRequestPayout, loading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTransactionIcon = (type: string) => {
    return type === 'subscription' ? <Calendar className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Earnings Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Earnings Overview
          </CardTitle>
          <CardDescription>
            Your revenue and payout information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(earnings.totalRevenue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(earnings.monthlyRevenue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Subscriptions</p>
              <p className="text-xl font-semibold">{formatCurrency(earnings.subscriptionRevenue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Purchases</p>
              <p className="text-xl font-semibold">{formatCurrency(earnings.purchaseRevenue)}</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Available for Payout</span>
              <span className="text-lg font-bold">{formatCurrency(earnings.payoutBalance)}</span>
            </div>
            <Button 
              onClick={() => onRequestPayout(earnings.payoutBalance)}
              disabled={earnings.payoutBalance <= 0 || loading}
              className="w-full"
            >
              Request Payout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Your latest earnings activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {earnings.recentTransactions.length > 0 ? (
              earnings.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+{formatCurrency(transaction.amount)}</p>
                    <Badge variant={transaction.status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No transactions yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningsCard;
