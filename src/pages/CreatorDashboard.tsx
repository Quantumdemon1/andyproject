
import React from "react";
import MainLayout from "@/components/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, DollarSign, TrendingUp, CreditCard, Settings
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AnalyticsGrid from "@/components/dashboard/AnalyticsGrid";
import ContentUploadTab from "@/components/dashboard/ContentUploadTab";
import SubscriptionsTab from "@/components/dashboard/SubscriptionsTab";
import AnalyticsTab from "@/components/dashboard/AnalyticsTab";
import PaymentsTab from "@/components/dashboard/PaymentsTab";
import SettingsTab from "@/components/dashboard/SettingsTab";

const CreatorDashboard = () => {
  const { user } = useAuth();

  return (
    <MainLayout title="CREATOR DASHBOARD" backButton>
      <div className="p-4 max-w-6xl mx-auto">
        <AnalyticsGrid />
        
        <Tabs defaultValue="upload" className="mb-8">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="upload">
              <Upload size={16} className="mr-2" /> Upload
            </TabsTrigger>
            <TabsTrigger value="subscriptions">
              <DollarSign size={16} className="mr-2" /> Subscriptions
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp size={16} className="mr-2" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard size={16} className="mr-2" /> Payments
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings size={16} className="mr-2" /> Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <ContentUploadTab />
          </TabsContent>
          
          <TabsContent value="subscriptions">
            <SubscriptionsTab />
          </TabsContent>
          
          <TabsContent value="analytics">
            <AnalyticsTab />
          </TabsContent>
          
          <TabsContent value="payments">
            <PaymentsTab />
          </TabsContent>
          
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default CreatorDashboard;
