
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Pin, CheckCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Conversation } from "@/hooks/useMessaging";

interface MessagePreviewProps {
  conversation: Conversation;
  isActive?: boolean;
  onClick?: () => void;
}

const MessagePreview: React.FC<MessagePreviewProps> = ({
  conversation,
  isActive = false,
  onClick,
}) => {
  const timeAgo = conversation.lastMessage?.created_at 
    ? formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: false })
    : "";
  
  return (
    <div 
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
        isActive ? "bg-white/10" : "hover:bg-white/5"
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className="h-12 w-12 border border-white/20">
          {conversation.avatar_url ? (
            <img 
              src={conversation.avatar_url} 
              alt={conversation.name} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-aura-purple text-white font-medium">
              {conversation.name.charAt(0)}
            </div>
          )}
        </Avatar>
        {conversation.is_online && (
          <div className="absolute bottom-0 right-0">
            <div className="h-3 w-3 rounded-full bg-green-500 border-2 border-aura-charcoal"></div>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <h4 className="font-medium text-sm truncate">{conversation.name}</h4>
            {conversation.isPinned && (
              <Pin className="h-3 w-3 text-aura-purple" />
            )}
          </div>
          {timeAgo && (
            <span className="text-xs text-gray-400">{timeAgo}</span>
          )}
        </div>
        <div className="flex items-center">
          {conversation.lastMessage ? (
            <>
              <p className="text-sm text-gray-400 truncate flex-1">
                {conversation.lastMessage.content || "Attachment"}
              </p>
              <CheckCheck className="h-3 w-3 text-aura-blue ml-1 flex-shrink-0" />
            </>
          ) : (
            <p className="text-sm text-gray-400 truncate flex-1">New conversation</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagePreview;
