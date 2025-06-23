
import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Reply, MoreVertical } from "lucide-react";
import MessageActions from "@/components/MessageActions";
import MessageStatus from "./MessageStatus";
import MessageReactions from "./MessageReactions";
import { Message } from "@/types/messaging";

interface MessageItemProps {
  message: Message;
  onDelete: (messageId: string) => Promise<void>;
  onReply?: (message: Message) => void;
  showAvatar?: boolean;
  isMobile?: boolean;
  currentUserId?: string;
  isReply?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  onDelete, 
  onReply,
  showAvatar = true,
  isMobile = false,
  currentUserId,
  isReply = false
}) => {
  const [showActions, setShowActions] = useState(false);
  
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  const handleReplyClick = () => {
    if (onReply) {
      onReply(message);
    }
  };

  const renderAttachment = () => {
    if (!message.attachment_url) return null;

    const isImage = message.attachment_url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    
    if (isImage) {
      return (
        <div className="mt-2">
          <img 
            src={message.attachment_url} 
            alt="Attachment" 
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(message.attachment_url, '_blank')}
          />
        </div>
      );
    }

    return (
      <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10 max-w-xs">
        <a 
          href={message.attachment_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-aura-blue hover:text-aura-purple transition-colors"
        >
          📎 Download attachment
        </a>
      </div>
    );
  };

  const renderReplyPreview = () => {
    if (!message.reply_to_message_id) return null;

    return (
      <div className="mb-2 p-2 bg-white/5 rounded border-l-2 border-aura-purple">
        <p className="text-xs text-aura-purple">Replying to message</p>
      </div>
    );
  };

  return (
    <div 
      className={`group flex gap-3 py-2 px-4 hover:bg-white/5 transition-colors ${
        message.isMe ? 'flex-row-reverse' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showAvatar && (
        <Avatar className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} flex-shrink-0`}>
          <AvatarImage src={message.avatar_url} alt="User" />
          <AvatarFallback className="bg-aura-purple text-white text-sm">
            {message.isMe ? 'You' : (message.username?.charAt(0).toUpperCase() || 'U')}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex-1 min-w-0 ${message.isMe ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-2 mb-1 ${message.isMe ? 'justify-end' : ''}`}>
          <span className={`font-medium text-sm ${isMobile ? 'text-xs' : ''}`}>
            {message.isMe ? 'You' : (message.username || 'User')}
          </span>
          <span className={`text-xs text-gray-400 ${isMobile ? 'text-[10px]' : ''}`}>
            {timeAgo}
          </span>
          {message.isMe && (
            <MessageStatus status={message.status} />
          )}
        </div>
        
        {renderReplyPreview()}
        
        <div className={`${message.isMe ? 'bg-aura-purple text-white' : 'bg-white/10 text-gray-100'} 
          rounded-lg px-3 py-2 inline-block max-w-xs break-words ${isMobile ? 'text-sm' : ''}`}>
          {message.content}
        </div>
        
        {renderAttachment()}
        
        <MessageReactions messageId={message.id} className="mt-1" />
        
        <div className={`flex items-center gap-1 mt-1 ${
          showActions || isMobile ? 'opacity-100' : 'opacity-0'
        } transition-opacity ${message.isMe ? 'justify-end' : ''}`}>
          {onReply && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-gray-400 hover:text-gray-200"
              onClick={handleReplyClick}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
          
          <MessageActions 
            message={message} 
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
