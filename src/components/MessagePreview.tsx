
import React from "react";
import { formatDistanceToNow } from "date-fns";

interface MessagePreviewProps {
  id: string;
  avatarUrl: string;
  name: string;
  message: string;
  timestamp: Date;
  isOnline?: boolean;
  isActive?: boolean;
}

const MessagePreview: React.FC<MessagePreviewProps> = ({
  id,
  avatarUrl,
  name,
  message,
  timestamp,
  isOnline = false,
  isActive = false,
}) => {
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: false });
  
  return (
    <div 
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
        isActive ? "bg-white/10" : "hover:bg-white/5"
      }`}
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
          <h4 className="font-medium text-sm truncate">{name}</h4>
          <span className="text-xs text-gray-400">{timeAgo}</span>
        </div>
        <p className="text-sm text-gray-400 truncate">{message}</p>
      </div>
    </div>
  );
};

export default MessagePreview;
