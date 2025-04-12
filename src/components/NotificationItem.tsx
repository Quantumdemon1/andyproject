
import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type NotificationType = 'subscription' | 'like' | 'comment' | 'tip' | 'mention';

interface NotificationItemProps {
  id: string;
  type: NotificationType;
  avatarUrl: string;
  content: string;
  timestamp: Date;
  isRead?: boolean;
  onDismiss?: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  type,
  avatarUrl,
  content,
  timestamp,
  isRead = false,
  onDismiss,
}) => {
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
  
  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'subscription':
        return "bg-aura-blue";
      case 'tip':
        return "bg-green-500";
      case 'comment':
        return "bg-yellow-500";
      case 'like':
        return "bg-pink-500";
      case 'mention':
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };
  
  const typeColor = getTypeColor(type);
  
  return (
    <div className={cn(
      "flex items-start gap-3 p-4 border-b border-white/10",
      !isRead && "bg-white/5"
    )}>
      <div className="relative">
        <div 
          className="h-12 w-12 rounded-full bg-cover bg-center border border-white/20"
          style={{ backgroundImage: `url(${avatarUrl})` }}
        />
        <div className="absolute bottom-0 right-0">
          <div className={`h-3 w-3 rounded-full ${typeColor} border-2 border-aura-charcoal`}></div>
        </div>
      </div>
      
      <div className="flex-1">
        <p className="text-sm">{content}</p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
      </div>
      
      {onDismiss && (
        <button
          onClick={() => onDismiss(id)}
          className="text-gray-400 hover:text-white"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default NotificationItem;
