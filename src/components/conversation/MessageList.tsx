
import React, { useRef, useEffect, useCallback } from "react";
import MessageItem from "./MessageItem";
import { Message } from "@/types/messaging";
import { useMessageStatus } from "@/hooks/useMessageStatus";
import { useAuth } from "@/contexts/AuthContext";

interface MessageListProps {
  messages: Message[];
  onDelete: (messageId: string) => Promise<void>;
  onReplyToMessage?: (message: Message) => void;
  isMobile?: boolean;
  conversationId: string;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  onDelete, 
  onReplyToMessage,
  isMobile = false,
  conversationId
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const messageElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  
  const { markMessagesAsDelivered, markMessagesAsRead } = useMessageStatus(conversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as delivered when they load
  useEffect(() => {
    if (messages.length > 0) {
      markMessagesAsDelivered(messages);
    }
  }, [messages, markMessagesAsDelivered]);

  // Set up intersection observer for read receipts
  const setupIntersectionObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visibleMessages: Message[] = [];
        
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const messageId = entry.target.getAttribute('data-message-id');
            const message = messages.find(m => m.id === messageId);
            if (message && message.sender_id !== user?.id) {
              visibleMessages.push(message);
            }
          }
        });

        if (visibleMessages.length > 0) {
          markMessagesAsRead(visibleMessages);
        }
      },
      {
        threshold: 0.5,
        rootMargin: '0px'
      }
    );

    // Observe all message elements
    messageElementsRef.current.forEach((element) => {
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    });
  }, [messages, user?.id, markMessagesAsRead]);

  useEffect(() => {
    setupIntersectionObserver();
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [setupIntersectionObserver]);

  const setMessageRef = useCallback((messageId: string, element: HTMLDivElement | null) => {
    if (element) {
      messageElementsRef.current.set(messageId, element);
    } else {
      messageElementsRef.current.delete(messageId);
    }
  }, []);

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
            <div
              key={message.id}
              ref={(el) => setMessageRef(message.id, el)}
              data-message-id={message.id}
            >
              <MessageItem
                message={message}
                onDelete={onDelete}
                onReply={onReplyToMessage}
                showAvatar={showAvatar}
                isMobile={isMobile}
              />
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
