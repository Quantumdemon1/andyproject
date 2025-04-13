
import React from "react";
import { Conversation as ConversationType, Message } from "@/hooks/useMessaging";
import { useAuth } from "@/contexts/AuthContext";
import ConversationHeader from "./conversation/ConversationHeader";
import MessageList from "./conversation/MessageList";
import MessageComposer from "./conversation/MessageComposer";

interface ConversationProps {
  currentChat: ConversationType | null;
  messages: Message[];
  sendMessage: (content: string, attachmentUrl?: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  isMobile?: boolean;
}

const Conversation: React.FC<ConversationProps> = ({ 
  currentChat, 
  messages, 
  sendMessage,
  deleteMessage,
  isMobile = false
}) => {
  const { user } = useAuth();
  
  if (!currentChat) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header - Hidden on mobile as we're using MainLayout's header */}
      {!isMobile && <ConversationHeader conversation={currentChat} />}

      {/* Message list */}
      <MessageList 
        messages={messages} 
        onDelete={deleteMessage}
        isMobile={isMobile}
      />

      {/* Message composer */}
      <MessageComposer 
        onSendMessage={sendMessage}
        isMobile={isMobile}
      />
    </div>
  );
};

export default Conversation;
