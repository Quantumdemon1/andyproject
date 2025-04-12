
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Pin, CheckCheck } from "lucide-react";

interface MessagePreviewProps {
  id: string;
  avatarUrl: string;
  name: string;
  message: string;
  timestamp: Date;
  isOnline?: boolean;
  isActive?: boolean;
  isPinned?: boolean;
  onClick?: () => void;
}

const MessagePreview: React.FC<MessagePreviewProps> = ({
  id,
  avatarUrl,
  name,
  message,
  timestamp,
  isOnline = false,
  isActive = false,
  isPinned = false,
  onClick,
}) => {
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: false });
  
  return (
    <div 
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
        isActive ? "bg-white/10" : "hover:bg-white/5"
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <div 
          className="h-12 w-12 rounded-full bg-cover bg-center border border-white/20"
          style={{ backgroundImage: `url(${avatarUrl})` }}
        />
        {isOnline && (
          <div className="absolute bottom-0 right-0">
            <div className="h-3 w-3 rounded-full bg-green-500 border-2 border-aura-charcoal"></div>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <h4 className="font-medium text-sm truncate">{name}</h4>
            {isPinned && (
              <Pin className="h-3 w-3 text-aura-purple" />
            )}
          </div>
          <span className="text-xs text-gray-400">{timeAgo}</span>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-400 truncate flex-1">{message}</p>
          <CheckCheck className="h-3 w-3 text-aura-blue ml-1 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default MessagePreview;
