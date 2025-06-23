
import React, { useState } from "react";
import MainLayout from "@/components/MainLayout";
import PostComposer from "@/components/home/PostComposer";
import ContentTabs from "@/components/home/ContentTabs";
import SubscriptionNotice from "@/components/home/SubscriptionNotice";
import PostsFeed from "@/components/home/PostsFeed";
import HomeSidebar from "@/components/home/HomeSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [activeTab, setActiveTab] = useState("all");
  const isMobile = useIsMobile();

  return (
    <MainLayout 
      title="HOME" 
      icons={!isMobile} 
      searchBar={!isMobile} 
      rightSidebar={<HomeSidebar />}
    >
      <div>
        <PostComposer />
        <ContentTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <SubscriptionNotice />
        <PostsFeed />
      </div>
    </MainLayout>
  );
};

export default Index;
