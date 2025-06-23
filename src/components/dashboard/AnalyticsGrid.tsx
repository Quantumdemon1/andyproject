
import React from "react";
import { 
  TrendingUp, DollarSign, Users, MessageSquare
} from "lucide-react";
import AnalyticsCard from "./AnalyticsCard";

interface AnalyticItem {
  label: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}

const AnalyticsGrid: React.FC = () => {
  const analyticItems: AnalyticItem[] = [
    {
      label: "Subscribers",
      value: 1243,
      change: 12.5,
      icon: <Users className="h-4 w-4 text-blue-500" />
    },
    {
      label: "Revenue",
      value: "$3,854",
      change: 8.2,
      icon: <DollarSign className="h-4 w-4 text-green-500" />
    },
    {
      label: "Engagement",
      value: "24%",
      change: -2.4,
      icon: <TrendingUp className="h-4 w-4 text-purple-500" />
    },
    {
      label: "Messages",
      value: 87,
      change: 15.8,
      icon: <MessageSquare className="h-4 w-4 text-orange-500" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {analyticItems.map((item, index) => (
        <AnalyticsCard key={index} item={item} />
      ))}
    </div>
  );
};

export default AnalyticsGrid;
