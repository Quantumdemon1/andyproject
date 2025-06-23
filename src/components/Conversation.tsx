
import React, { useState } from "react";
import { Conversation as ConversationType, Message } from "@/hooks/useMessaging";
import { useAuth } from "@/contexts/AuthContext";
import ConversationHeader from "./conversation/ConversationHeader";
import MessageList from "./conversation/MessageList";
import MessageComposer from "./conversation/MessageComposer";

interface ConversationProps {
  currentChat: ConversationType | null;
  messages: Message[];
  sendMessage: (content: string, attachmentUrl?: string, replyToId?: string, threadId?: string) => Promise<void>;
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
  const [replyToMessage, setReplyToMessage] = useState<{ id: string; content: string; sender_name: string } | null>(null);
  
  if (!currentChat) {
    return null;
  }

  const handleReply = (message: Message) => {
    setReplyToMessage({
      id: message.id,
      content: message.content,
      sender_name: message.isMe ? 'You' : 'User'
    });
  };

  const handleCancelReply = () => {
    setReplyToMessage(null);
  };

  const handleSendMessage = async (
    content: string, 
    attachmentUrl?: string, 
    replyToId?: string, 
    threadId?: string
  ) => {
    await sendMessage(content, attachmentUrl, replyToId, threadId);
    setReplyToMessage(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Hidden on mobile as we're using MainLayout's header */}
      {!isMobile && <ConversationHeader conversation={currentChat} />}

      {/* Message list */}
      <MessageList 
        messages={messages} 
        onDelete={deleteMessage}
        onReply={handleReply}
        isMobile={isMobile}
      />

      {/* Message composer */}
      <MessageComposer 
        onSendMessage={handleSendMessage}
        replyToMessage={replyToMessage}
        onCancelReply={handleCancelReply}
        isMobile={isMobile}
      />
    </div>
  );
};

export default Conversation;
