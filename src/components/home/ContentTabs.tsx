
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContentTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ContentTabs: React.FC<ContentTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <Tabs defaultValue={activeTab} className="mb-8">
      <TabsList className="bg-transparent border-b border-white/10 w-full justify-start p-0 h-auto">
        <TabsTrigger 
          value="all" 
          onClick={() => setActiveTab("all")} 
          className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-aura-blue data-[state=active]:rounded-none px-6 py-2 text-gray-400"
        >
          All
        </TabsTrigger>
        <TabsTrigger 
          value="purchased" 
          onClick={() => setActiveTab("purchased")} 
          className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-aura-blue data-[state=active]:rounded-none px-6 py-2 text-gray-400"
        >
          Purchased
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default ContentTabs;
