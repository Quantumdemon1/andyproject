
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AnalyticItem {
  label: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}

interface AnalyticsCardProps {
  item: AnalyticItem;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ item }) => {
  return (
    <Card className="bg-aura-charcoal border-white/10">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">{item.label}</p>
            <p className="text-2xl font-bold mt-1">{item.value}</p>
          </div>
          {item.icon}
        </div>
        <div className="mt-2 text-sm">
          <span className={`font-medium ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {item.change > 0 ? '+' : ''}{item.change}%
          </span>
          <span className="text-gray-400 ml-1">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;
