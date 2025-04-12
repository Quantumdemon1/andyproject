
import React, { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import NotificationItem from "@/components/NotificationItem";

const SidebarContent = () => (
  <div className="space-y-6">
    <Card className="bg-aura-charcoal border-white/10">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">SUBSCRIPTION</h3>
        <div className="flex flex-col">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Subscription price and promotions</h3>
            <span className="text-gray-400">&gt;</span>
          </div>
          <p className="text-sm text-gray-400">Free subscription</p>
        </div>
      </div>
    </Card>
    
    <Card className="bg-aura-charcoal border-white/10">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">SCHEDULED EVENTS</h3>
        <p className="text-sm text-gray-400">Now you can schedule Posts, Messages and Streams to grow your online presence, and view it in Calendar</p>
        
        <div className="flex justify-center my-6">
          <div className="h-16 w-16 rounded-lg flex items-center justify-center bg-white/5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
          </div>
        </div>
        
        <p className="text-sm text-center text-gray-400">You have no scheduled events.</p>
        
        <div className="bg-white/5 h-12 flex items-center justify-center mt-4 rounded-md cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus text-gray-400"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        </div>
        
        <div className="mt-4 flex justify-end">
          <span className="text-aura-blue text-sm cursor-pointer">VIEW QUEUE</span>
        </div>
      </div>
    </Card>
    
    <Card className="bg-aura-charcoal border-white/10">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-aura-blue mb-4">P-P-V MESSAGES</h3>
        <div className="bg-gradient-to-br from-aura-blue to-aura-purple/50 p-6 rounded-lg flex items-center justify-center relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail text-white"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          <div className="absolute transform translate-x-6 translate-y-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dollar-sign text-white"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        </div>
      </div>
    </Card>
  </div>
);

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("all");
  
  // Mock notifications data
  const notifications = [
    {
      id: "1",
      type: "subscription" as const,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces&q=80",
      content: "Emma Johnson subscribed to your content!",
      timestamp: new Date(2023, 3, 12, 11, 0),
    },
    {
      id: "2",
      type: "tip" as const,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces&q=80",
      content: "Marcus Lee sent you a $10 tip with message: 'Love your work!'",
      timestamp: new Date(2023, 3, 12, 10, 30),
    },
    {
      id: "3",
      type: "comment" as const,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces&q=80",
      content: "Sophia Rivera commented on your post: 'This is absolutely beautiful! I love the composition.'",
      timestamp: new Date(2023, 3, 11, 16, 22),
    },
    {
      id: "4",
      type: "like" as const,
      avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=faces&q=80",
      content: "David Wilson liked your post 'Sunset at the Beach'",
      timestamp: new Date(2023, 3, 11, 14, 45),
    },
    {
      id: "5",
      type: "mention" as const,
      avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=faces&q=80",
      content: "Olivia Chen mentioned you in a post: 'Check out this amazing photographer @yourusername'",
      timestamp: new Date(2023, 3, 10, 9, 12),
    },
  ];
  
  const tabs = [
    { id: "all", label: "All", count: 99 },
    { id: "subscriptions", label: "Subscriptions", count: 20 },
    { id: "purchases", label: "Purchases" },
    { id: "tips", label: "Tips" },
    { id: "tags", label: "Tags" },
    { id: "comments", label: "Comments" },
    { id: "mentions", label: "Mentions" },
  ];
  
  const handleDismissNotification = (id: string) => {
    console.log(`Dismissed notification ${id}`);
    // Here you would implement the logic to dismiss a notification
  };
  
  return (
    <MainLayout title="NOTIFICATIONS" backButton settings rightSidebar={<SidebarContent />}>
      <div>
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                className={`rounded-full flex items-center whitespace-nowrap ${
                  activeTab === tab.id 
                    ? "bg-aura-blue text-white" 
                    : "bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {tab.count && (
                  <span className="ml-1 bg-white/20 text-white text-xs rounded-full px-1.5 py-0.5">
                    {tab.count}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="bg-aura-charcoal rounded-lg border border-white/10 overflow-hidden">
          <div className="divide-y divide-white/10">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                id={notification.id}
                type={notification.type}
                avatarUrl={notification.avatarUrl}
                content={notification.content}
                timestamp={notification.timestamp}
                onDismiss={handleDismissNotification}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Notifications;
