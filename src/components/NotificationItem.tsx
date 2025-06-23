
import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { markNotificationAsRead } from "@/api/notificationsApi";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  
  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'subscription':
        return "bg-gradient-to-r from-aura-charcoal to-aura-blue";
      case 'tip':
        return "bg-gradient-to-r from-aura-charcoal to-green-500";
      case 'comment':
        return "bg-gradient-to-r from-aura-charcoal to-yellow-500";
      case 'like':
        return "bg-gradient-to-r from-aura-charcoal to-pink-500";
      case 'mention':
        return "bg-gradient-to-r from-aura-charcoal to-aura-purple";
      default:
        return "bg-gradient-to-r from-aura-charcoal to-gray-500";
    }
  };
  
  const typeColor = getTypeColor(type);

  const handleClick = async () => {
    if (!isRead) {
      await markNotificationAsRead(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  };
  
  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors",
        !isRead && "bg-white/5"
      )}
      onClick={handleClick}
    >
      <div className="relative">
        <div 
          className="h-12 w-12 rounded-full bg-cover bg-center border border-white/20"
          style={{ backgroundImage: `url(${avatarUrl})` }}
        />
        <div className="absolute bottom-0 right-0">
          <div className={`h-3 w-3 rounded-full ${typeColor} border-2 border-aura-charcoal shadow-sm`}></div>
        </div>
      </div>
      
      <div className="flex-1">
        <p className="text-sm">{content}</p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
      </div>

      {!isRead && (
        <div className="h-2 w-2 bg-aura-blue rounded-full mt-2"></div>
      )}
      
      {onDismiss && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(id);
          }}
          className="text-gray-400 hover:text-white"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default NotificationItem;
