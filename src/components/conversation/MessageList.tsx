
import React, { useRef, useEffect } from "react";
import MessageItem from "./MessageItem";
import { Message } from "@/types/messaging";

interface MessageListProps {
  messages: Message[];
  onDelete: (messageId: string) => Promise<void>;
  onReply?: (message: Message) => void;
  isMobile?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  onDelete, 
  onReply,
  isMobile = false 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="py-4">
        {messages.map((message, index) => {
          // Group consecutive messages from the same sender
          const previousMessage = messages[index - 1];
          const showAvatar = !previousMessage || previousMessage.sender_id !== message.sender_id;
          
          return (
            <MessageItem
              key={message.id}
              message={message}
              onDelete={onDelete}
              onReply={onReply}
              showAvatar={showAvatar}
              isMobile={isMobile}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
