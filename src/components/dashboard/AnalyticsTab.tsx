
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const AnalyticsTab: React.FC = () => {
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
            <p className="mb-2">Analytics visualization coming soon</p>
            <p className="text-sm text-gray-500">
              Track content performance, subscriber growth, and engagement metrics
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsTab;
