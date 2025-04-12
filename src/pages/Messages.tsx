import React, { useState, useMemo } from "react";
import MainLayout from "@/components/MainLayout";
import MessagePreview from "@/components/MessagePreview";
import Conversation from "@/components/Conversation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Pin, Filter, Archive, Loader2 } from "lucide-react";
import { useMessaging } from "@/hooks/useMessaging";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
const Messages = () => {
  const {
    user,
    loading: authLoading
  } = useAuth();
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    setCurrentConversation,
    sendMessage,
    togglePinConversation,
    deleteMessage,
    pinnedConversations
  } = useMessaging();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter conversations based on activeTab and searchQuery
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      // Tab filter
      if (activeTab === "pinned" && !conv.isPinned) return false;
      if (activeTab === "unread") {
        // Check if there are unread messages
        const hasUnreadMessages = conv.lastMessage?.status !== "read";
        if (!hasUnreadMessages) return false;
      }
      if (activeTab === "archive") {
        // Archive functionality would need to be implemented
        return false;
      }

      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const nameMatch = conv.name.toLowerCase().includes(searchLower);
        const contentMatch = conv.lastMessage?.content?.toLowerCase().includes(searchLower);
        return nameMatch || contentMatch;
      }
      return true;
    });
  }, [conversations, activeTab, searchQuery]);
  const tabs = [{
    id: "all",
    label: "All",
    count: conversations.length
  }, {
    id: "pinned",
    label: "Pinned",
    count: pinnedConversations.length
  }, {
    id: "unread",
    label: "Unread",
    count: conversations.filter(c => c.lastMessage?.status !== "read").length
  }, {
    id: "archive",
    label: "Archive",
    icon: <Archive className="h-4 w-4" />
  }];
  const handlePinClick = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    togglePinConversation(convId);
  };

  // If auth is not ready, show loading state
  if (authLoading) {
    return <MainLayout title="MESSAGES" backButton icons>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-aura-purple mb-4" />
            <p className="text-white/60">Loading...</p>
          </div>
        </div>
      </MainLayout>;
  }

  // If not logged in, show auth prompt
  if (!user) {
    return <MainLayout title="MESSAGES" backButton icons>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center max-w-md mx-auto p-6 bg-white/5 rounded-lg border border-white/10">
            <h2 className="text-2xl font-semibold mb-4">Sign in to access messages</h2>
            <p className="text-white/60 mb-6">
              You need to be signed in to view and send messages.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="gradient" size="lg" onClick={() => toast({
              title: "Authentication",
              description: "Please implement the authentication flow to sign in."
            })}>
                Sign In
              </Button>
              <Button variant="outline" size="lg" onClick={() => toast({
              title: "Authentication",
              description: "Please implement the authentication flow to sign up."
            })} className="text-indigo-700">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>;
  }
  return <MainLayout title="MESSAGES" backButton icons>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left side - Message list */}
        <div className="w-96 border-r border-white/10 overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-white/10">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input className="pl-9 pr-4 py-2 w-full bg-white/5 border-white/10" placeholder="Search messages..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm text-gray-400">MESSAGES</div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setActiveTab("pinned")}>
                  <Pin className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="gradient" size="sm" className="h-8 w-8 p-0" onClick={() => toast({
                title: "Create new message",
                description: "This feature is coming soon!"
              })}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {tabs.map(tab => <Button key={tab.id} variant={activeTab === tab.id ? "gradient" : "ghost"} size="sm" className={`rounded-full flex items-center whitespace-nowrap ${activeTab === tab.id ? "" : "bg-white/5 text-gray-300 hover:bg-white/10"}`} onClick={() => setActiveTab(tab.id)}>
                  {tab.icon ? tab.icon : tab.label}
                  {tab.count > 0 && <Badge variant={activeTab === tab.id ? "tier" : "notification"} className="ml-1 min-w-5 text-center">
                      {tab.count}
                    </Badge>}
                </Button>)}
            </div>
          </div>
          
          <div className="divide-y divide-white/5 flex-1 overflow-auto">
            {loading ? <div className="flex justify-center items-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-aura-purple" />
              </div> : filteredConversations.length > 0 ? filteredConversations.map(conversation => <MessagePreview key={conversation.id} conversation={conversation} isActive={currentConversation?.id === conversation.id} onClick={() => setCurrentConversation(conversation)} />) : <div className="p-4 text-center text-gray-400">
                {searchQuery ? "No conversations match your search" : "No conversations found"}
              </div>}
          </div>
        </div>
        
        {/* Right side - Conversation or empty state */}
        <div className="flex-1 flex flex-col">
          {currentConversation ? <Conversation currentChat={currentConversation} messages={messages} sendMessage={sendMessage} deleteMessage={deleteMessage} /> : <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">Select any Conversation or send a New Message</h2>
                <Button variant="gradient" size="lg" className="btn-pulse px-8 py-6" onClick={() => toast({
              title: "Create new message",
              description: "This feature is coming soon!"
            })}>
                  NEW MESSAGE
                </Button>
              </div>
            </div>}
        </div>
      </div>
    </MainLayout>;
};
export default Messages;