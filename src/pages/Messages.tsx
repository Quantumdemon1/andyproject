
import React, { useState } from "react";
import MainLayout from "@/components/MainLayout";
import MessagePreview from "@/components/MessagePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Messages = () => {
  const [activeTab, setActiveTab] = useState("all");
  
  // Mock messages data
  const messages = [
    {
      id: "1",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces&q=80",
      name: "Emma Johnson",
      message: "Hi there! Just wanted to check in about the photo session next week.",
      timestamp: new Date(2023, 3, 12, 11, 4),
      isOnline: true,
    },
    {
      id: "2",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces&q=80",
      name: "Marcus Lee",
      message: "Thanks for subscribing to my content! Let me know if you have any questions.",
      timestamp: new Date(2023, 3, 12, 11, 4),
      isOnline: true,
    },
    {
      id: "3",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces&q=80",
      name: "Sophia Rivera",
      message: "I just posted new artwork that I think you might like based on your interests.",
      timestamp: new Date(2023, 3, 12, 11, 3),
      isOnline: false,
    },
    {
      id: "4",
      avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=faces&q=80",
      name: "David Wilson",
      message: "Hey! Are you interested in the new limited edition prints I'm releasing?",
      timestamp: new Date(2023, 3, 12, 11, 0),
      isOnline: false,
    },
    {
      id: "5",
      avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=faces&q=80",
      name: "Olivia Chen",
      message: "Thank you for the feedback on my latest collection! I really appreciate it.",
      timestamp: new Date(2023, 3, 12, 11, 0),
      isOnline: true,
    },
    {
      id: "6",
      avatarUrl: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=150&h=150&fit=crop&crop=faces&q=80",
      name: "James Peterson",
      message: "I'm planning a live session next week. Would you like to join?",
      timestamp: new Date(2023, 3, 12, 10, 57),
      isOnline: true,
    },
  ];
  
  const tabs = [
    { id: "all", label: "All", count: 99 },
    { id: "pinned", label: "Pinned", count: 3 },
    { id: "priority", label: "Priority", count: 9 },
    { id: "unread", label: "Unread", count: 41 },
    { id: "coolest", label: "Coolest people" },
  ];
  
  return (
    <MainLayout title="MESSAGES" backButton icons>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left side - Message list */}
        <div className="w-96 border-r border-white/10 overflow-y-auto">
          <div className="p-4 border-b border-white/10">
            <div className="text-sm text-gray-400 mb-3">NEWEST FIRST</div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {tabs.map(tab => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "gradient" : "ghost"}
                  size="sm"
                  className={`rounded-full flex items-center whitespace-nowrap ${
                    activeTab === tab.id 
                      ? "" 
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  {tab.count && (
                    <span className={`ml-1 ${activeTab === tab.id ? 'bg-white/20' : 'notification-gradient'} text-white text-xs rounded-full px-1.5 py-0.5`}>
                      {tab.count}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="divide-y divide-white/5">
            {messages.map((message, index) => (
              <MessagePreview
                key={message.id}
                id={message.id}
                avatarUrl={message.avatarUrl}
                name={message.name}
                message={message.message}
                timestamp={message.timestamp}
                isOnline={message.isOnline}
                isActive={index === 0}
              />
            ))}
          </div>
        </div>
        
        {/* Right side - Empty state or current conversation */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Select any Conversation or send a New Message</h2>
              <Button variant="gradient" size="lg" className="btn-pulse px-8 py-6">
                NEW MESSAGE
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
