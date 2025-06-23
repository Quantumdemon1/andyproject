
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, DollarSign, Eye, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCreatorEarnings, EarningsData } from "@/api/earningsApi";

const AnalyticsTab: React.FC = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadAnalytics = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const earningsData = await fetchCreatorEarnings(user.id);
      setEarnings(earningsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [user?.id]);

  if (!earnings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
          <CardDescription>
            Track your growth and engagement metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="mb-2">Loading analytics...</p>
              <Button onClick={loadAnalytics} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Load Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Performance Analytics</h3>
          <p className="text-sm text-gray-500">Track your content performance and revenue</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAnalytics} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${earnings.totalRevenue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-600 mt-2">
              All-time earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Monthly Revenue</p>
                <p className="text-2xl font-bold">
                  ${earnings.monthlyRevenue.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Transactions</p>
                <p className="text-2xl font-bold">
                  {earnings.recentTransactions.length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-purple-600 mt-2">
              Recent activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>
            Analyze your income sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-medium">Subscription Revenue</p>
                  <p className="text-sm text-gray-600">Recurring monthly income</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">
                  ${earnings.subscriptionRevenue.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  {earnings.totalRevenue > 0 
                    ? `${((earnings.subscriptionRevenue / earnings.totalRevenue) * 100).toFixed(1)}% of total`
                    : '0% of total'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium">Purchase Revenue</p>
                  <p className="text-sm text-gray-600">One-time purchases and tips</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">
                  ${earnings.purchaseRevenue.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  {earnings.totalRevenue > 0 
                    ? `${((earnings.purchaseRevenue / earnings.totalRevenue) * 100).toFixed(1)}% of total`
                    : '0% of total'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>
            Key metrics and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {earnings.monthlyRevenue > 0 ? (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="font-medium text-green-800">Great Performance!</p>
                <p className="text-sm text-green-700">
                  You've earned ${earnings.monthlyRevenue.toFixed(2)} this month. Keep creating engaging content!
                </p>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="font-medium text-yellow-800">Growth Opportunity</p>
                <p className="text-sm text-yellow-700">
                  Start monetizing your content by setting up subscription tiers and promoting your work.
                </p>
              </div>
            )}
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-medium text-blue-800">Revenue Diversification</p>
              <p className="text-sm text-blue-700">
                Consider offering both subscription tiers and one-time purchases to maximize earnings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
