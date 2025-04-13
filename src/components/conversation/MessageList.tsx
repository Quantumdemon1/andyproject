
import React, { useRef, useEffect } from "react";
import { Message } from "@/hooks/useMessaging";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  onDelete: (messageId: string) => Promise<void>;
  isMobile?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, onDelete, isMobile = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-4'} space-y-4`}>
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          onDelete={onDelete}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
