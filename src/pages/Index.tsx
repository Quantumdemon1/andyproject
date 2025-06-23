
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/MainLayout";
import EnhancedPostComposer from "@/components/home/EnhancedPostComposer";
import ContentTabs from "@/components/home/ContentTabs";
import SubscriptionNotice from "@/components/home/SubscriptionNotice";
import PostsFeed from "@/components/home/PostsFeed";
import HomeSidebar from "@/components/home/HomeSidebar";
import LoadPostsButton from "@/components/home/LoadPostsButton";
import InstallPrompt from "@/components/mobile/InstallPrompt";
import PullToRefreshIndicator from "@/components/mobile/PullToRefreshIndicator";
import SkipLink from "@/components/accessibility/SkipLink";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useSwipeGestures } from "@/hooks/useSwipeGestures";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";

const Index = () => {
  const [activeTab, setActiveTab] = useState("all");
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Enable real-time updates
  useRealTimeUpdates();

  const handleRefreshFeed = async () => {
    // Invalidate all posts queries to force a refresh
    await queryClient.invalidateQueries({ queryKey: ['posts'] });
  };

  const { containerRef, isPulling, isRefreshing, progress } = usePullToRefresh({
    onRefresh: handleRefreshFeed,
    disabled: !isMobile
  });

  const swipeRef = useSwipeGestures({
    onSwipeLeft: () => {
      // Navigate to next tab
      const tabs = ["all", "following", "media", "recent"];
      const currentIndex = tabs.indexOf(activeTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      setActiveTab(tabs[nextIndex]);
    },
    onSwipeRight: () => {
      // Navigate to previous tab
      const tabs = ["all", "following", "media", "recent"];
      const currentIndex = tabs.indexOf(activeTab);
      const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      setActiveTab(tabs[prevIndex]);
    }
  });

  return (
    <>
      <SkipLink />
      <MainLayout 
        title="HOME" 
        icons={!isMobile} 
        searchBar={!isMobile} 
        rightSidebar={<HomeSidebar />}
      >
        <div 
          id="main-content"
          ref={(el) => {
            containerRef.current = el;
            swipeRef.current = el;
          }}
          className="touch-manipulation"
        >
          <PullToRefreshIndicator 
            progress={progress}
            isRefreshing={isRefreshing}
            isPulling={isPulling}
          />
          
          <EnhancedPostComposer onPostCreated={handleRefreshFeed} />
          <ContentTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <SubscriptionNotice />
          <LoadPostsButton onClick={handleRefreshFeed} />
          <PostsFeed filter={activeTab} />
          
          <InstallPrompt />
        </div>
      </MainLayout>
    </>
  );
};

export default Index;
