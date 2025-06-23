
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/MainLayout";
import EnhancedPostComposer from "@/components/home/EnhancedPostComposer";
import ContentTabs from "@/components/home/ContentTabs";
import SubscriptionNotice from "@/components/home/SubscriptionNotice";
import PostsFeed from "@/components/home/PostsFeed";
import HomeSidebar from "@/components/home/HomeSidebar";
import LoadPostsButton from "@/components/home/LoadPostsButton";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [activeTab, setActiveTab] = useState("all");
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const handleRefreshFeed = () => {
    // Invalidate all posts queries to force a refresh
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  };

  return (
    <MainLayout 
      title="HOME" 
      icons={!isMobile} 
      searchBar={!isMobile} 
      rightSidebar={<HomeSidebar />}
    >
      <div>
        <EnhancedPostComposer onPostCreated={handleRefreshFeed} />
        <ContentTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <SubscriptionNotice />
        <LoadPostsButton onClick={handleRefreshFeed} />
        <PostsFeed filter={activeTab} />
      </div>
    </MainLayout>
  );
};

export default Index;
