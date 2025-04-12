
import React, { useRef, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Check, CheckCheck, Paperclip, SmilePlus, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  status: "sent" | "delivered" | "read";
  isMe: boolean;
}

interface ConversationProps {
  currentChat: {
    id: string;
    name: string;
    avatarUrl: string;
    isOnline: boolean;
    messages: Message[];
  } | null;
}

const MessageStatus = ({ status }: { status: "sent" | "delivered" | "read" }) => {
  if (status === "read") {
    return <CheckCheck className="h-4 w-4 text-blue-400" />;
  } else if (status === "delivered") {
    return <CheckCheck className="h-4 w-4 text-gray-400" />;
  }
  return <Check className="h-4 w-4 text-gray-400" />;
};

const Conversation: React.FC<ConversationProps> = ({ currentChat }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = React.useState("");

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentChat?.messages]);

  if (!currentChat) {
    return null;
  }

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    // Here we would normally send the message to the backend
    console.log("Sending message:", newMessage);
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-white/10 bg-white/5">
        <div className="relative">
          <Avatar className="h-10 w-10 border border-white/20">
            <img src={currentChat.avatarUrl} alt={currentChat.name} />
          </Avatar>
          {currentChat.isOnline && (
            <div className="absolute bottom-0 right-0">
              <div className="h-3 w-3 rounded-full bg-green-500 border-2 border-aura-charcoal"></div>
            </div>
          )}
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">{currentChat.name}</h3>
          <p className="text-xs text-gray-400">
            {currentChat.isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentChat.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.isMe
                  ? "bg-gradient-to-r from-aura-blue to-aura-purple text-white"
                  : "bg-white/10 text-white"
              }`}
            >
              <p>{message.text}</p>
              <div
                className={`text-xs mt-1 flex items-center ${
                  message.isMe ? "justify-end" : ""
                }`}
              >
                <span className="text-gray-300">
                  {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                </span>
                {message.isMe && (
                  <span className="ml-1">
                    <MessageStatus status={message.status} />
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message composer */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="flex gap-2 items-end">
          <div className="flex-1 flex">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Paperclip className="h-5 w-5 text-gray-400" />
            </Button>
            <Textarea
              placeholder="Type a message..."
              className="flex-1 bg-white/10 border-white/10 focus-visible:ring-aura-purple resize-none h-10 leading-tight pt-2"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <Button variant="ghost" size="icon" className="rounded-full">
              <SmilePlus className="h-5 w-5 text-gray-400" />
            </Button>
          </div>
          <Button 
            onClick={handleSendMessage} 
            disabled={newMessage.trim() === ""}
            variant="gradient" 
            size="icon" 
            className="rounded-full"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
