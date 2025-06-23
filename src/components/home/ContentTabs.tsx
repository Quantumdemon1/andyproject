
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContentTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ContentTabs: React.FC<ContentTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="mb-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-aura-charcoal border border-white/10">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-aura-blue data-[state=active]:text-white"
          >
            All Posts
          </TabsTrigger>
          <TabsTrigger 
            value="following" 
            className="data-[state=active]:bg-aura-blue data-[state=active]:text-white"
          >
            Following
          </TabsTrigger>
          <TabsTrigger 
            value="media" 
            className="data-[state=active]:bg-aura-blue data-[state=active]:text-white"
          >
            Media
          </TabsTrigger>
          <TabsTrigger 
            value="recent" 
            className="data-[state=active]:bg-aura-blue data-[state=active]:text-white"
          >
            Recent
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ContentTabs;
