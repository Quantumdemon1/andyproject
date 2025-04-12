
import React, { useState } from "react";
import MainLayout from "@/components/MainLayout";
import MessagePreview from "@/components/MessagePreview";
import Conversation from "@/components/Conversation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Pin, Filter, Archive } from "lucide-react";

const Messages = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  
  // Mock messages data
  const messages = [
    {
      id: "1",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces&q=80",
      name: "Emma Johnson",
      message: "Hi there! Just wanted to check in about the photo session next week.",
      timestamp: new Date(2023, 3, 12, 11, 4),
      isOnline: true,
      isPinned: false,
    },
    {
      id: "2",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces&q=80",
      name: "Marcus Lee",
      message: "Thanks for subscribing to my content! Let me know if you have any questions.",
      timestamp: new Date(2023, 3, 12, 11, 4),
      isOnline: true,
      isPinned: true,
    },
    {
      id: "3",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces&q=80",
      name: "Sophia Rivera",
      message: "I just posted new artwork that I think you might like based on your interests.",
      timestamp: new Date(2023, 3, 12, 11, 3),
      isOnline: false,
      isPinned: false,
    },
    {
      id: "4",
      avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=faces&q=80",
      name: "David Wilson",
      message: "Hey! Are you interested in the new limited edition prints I'm releasing?",
      timestamp: new Date(2023, 3, 12, 11, 0),
      isOnline: false,
      isPinned: false,
    },
    {
      id: "5",
      avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=faces&q=80",
      name: "Olivia Chen",
      message: "Thank you for the feedback on my latest collection! I really appreciate it.",
      timestamp: new Date(2023, 3, 12, 11, 0),
      isOnline: true,
      isPinned: false,
    },
    {
      id: "6",
      avatarUrl: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=150&h=150&fit=crop&crop=faces&q=80",
      name: "James Peterson",
      message: "I'm planning a live session next week. Would you like to join?",
      timestamp: new Date(2023, 3, 12, 10, 57),
      isOnline: true,
      isPinned: false,
    },
  ];
  
  const tabs = [
    { id: "all", label: "All", count: 99 },
    { id: "pinned", label: "Pinned", count: 3 },
    { id: "priority", label: "Priority", count: 9 },
    { id: "unread", label: "Unread", count: 41 },
    { id: "archive", label: "Archive", icon: <Archive className="h-4 w-4" /> },
  ];
  
  // Mock conversation for the selected chat
  const mockConversation = {
    id: "1",
    name: "Emma Johnson",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces&q=80",
    isOnline: true,
    messages: [
      {
        id: "msg1",
        text: "Hey there! How are you doing today?",
        senderId: "emma",
        timestamp: new Date(2023, 3, 12, 10, 30),
        status: "read" as const,
        isMe: false,
      },
      {
        id: "msg2",
        text: "I'm doing great! Just working on some new designs. How about you?",
        senderId: "me",
        timestamp: new Date(2023, 3, 12, 10, 32),
        status: "read" as const,
        isMe: true,
      },
      {
        id: "msg3",
        text: "That sounds exciting! I'm preparing for the photo session next week.",
        senderId: "emma",
        timestamp: new Date(2023, 3, 12, 10, 35),
        status: "read" as const,
        isMe: false,
      },
      {
        id: "msg4",
        text: "Do you want to see a preview of the concepts I've been working on?",
        senderId: "me",
        timestamp: new Date(2023, 3, 12, 10, 37),
        status: "read" as const,
        isMe: true,
      },
      {
        id: "msg5",
        text: "Yes, absolutely! I'd love to see them.",
        senderId: "emma",
        timestamp: new Date(2023, 3, 12, 10, 38),
        status: "read" as const,
        isMe: false,
      },
      {
        id: "msg6",
        text: "Great, I'll send them over later today once I've finalized a few details. I think you'll like the direction we're heading in.",
        senderId: "me",
        timestamp: new Date(2023, 3, 12, 10, 40),
        status: "delivered" as const,
        isMe: true,
      },
    ],
  };
  
  // Filter messages based on activeTab and searchQuery
  const filteredMessages = messages.filter(msg => {
    let tabMatch = true;
    if (activeTab === "pinned") tabMatch = msg.isPinned;
    // Add more filtering logic for other tabs here
    
    const searchMatch = searchQuery ? 
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      msg.message.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    return tabMatch && searchMatch;
  });
  
  const currentChat = selectedChatId ? mockConversation : null;
  
  return (
    <MainLayout title="MESSAGES" backButton icons>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left side - Message list */}
        <div className="w-96 border-r border-white/10 overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-white/10">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                className="pl-9 pr-4 py-2 w-full bg-white/5 border-white/10"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm text-gray-400">MESSAGES</div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Pin className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="gradient" size="sm" className="h-8 w-8 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
                  {tab.icon ? tab.icon : tab.label}
                  {tab.count && (
                    <Badge variant={activeTab === tab.id ? "tier" : "notification"} className="ml-1 min-w-5 text-center">
                      {tab.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="divide-y divide-white/5 flex-1 overflow-auto">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((message) => (
                <MessagePreview
                  key={message.id}
                  id={message.id}
                  avatarUrl={message.avatarUrl}
                  name={message.name}
                  message={message.message}
                  timestamp={message.timestamp}
                  isOnline={message.isOnline}
                  isActive={selectedChatId === message.id}
                  isPinned={message.isPinned}
                  onClick={() => setSelectedChatId(message.id === selectedChatId ? null : message.id)}
                />
              ))
            ) : (
              <div className="p-4 text-center text-gray-400">No messages found</div>
            )}
          </div>
        </div>
        
        {/* Right side - Conversation or empty state */}
        <div className="flex-1 flex flex-col">
          {selectedChatId ? (
            <Conversation currentChat={currentChat} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">Select any Conversation or send a New Message</h2>
                <Button variant="gradient" size="lg" className="btn-pulse px-8 py-6">
                  NEW MESSAGE
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
