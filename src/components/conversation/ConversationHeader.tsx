
import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Conversation } from "@/hooks/useMessaging";

interface ConversationHeaderProps {
  conversation: Conversation;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ conversation }) => {
  return (
    <div className="flex items-center p-4 border-b border-white/10 bg-white/5">
      <div className="relative">
        <Avatar className="h-10 w-10 border border-white/20">
          <img src={conversation.avatar_url} alt={conversation.name} />
        </Avatar>
        {conversation.is_online && (
          <div className="absolute bottom-0 right-0">
            <div className="h-3 w-3 rounded-full bg-green-500 border-2 border-aura-charcoal"></div>
          </div>
        )}
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium">{conversation.name}</h3>
        <p className="text-xs text-gray-400">
          {conversation.is_online ? "Online" : "Offline"}
        </p>
      </div>
    </div>
  );
};

export default ConversationHeader;
