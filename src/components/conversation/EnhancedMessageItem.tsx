
import React, { useState } from 'react';
import { Message } from '@/types/messaging';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Reply, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import MessageReactionsPicker from './MessageReactionsPicker';
import MessageReactions from './MessageReactions';
import AttachmentPreview from './AttachmentPreview';

interface EnhancedMessageItemProps {
  message: Message;
  onDelete?: (messageId: string) => void;
  onReply?: (message: Message) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  reactions?: Array<{ emoji: string; count: number; hasReacted: boolean }>;
  currentUserId?: string;
  isReply?: boolean;
}

const EnhancedMessageItem: React.FC<EnhancedMessageItemProps> = ({
  message,
  onDelete,
  onReply,
  onAddReaction,
  onRemoveReaction,
  reactions = [],
  currentUserId,
  isReply = false
}) => {
  const [showActions, setShowActions] = useState(false);
  const isOwnMessage = message.sender_id === currentUserId;

  const handleAddReaction = (emoji: string) => {
    if (onAddReaction) {
      onAddReaction(message.id, emoji);
    }
  };

  const handleRemoveReaction = (emoji: string) => {
    if (onRemoveReaction) {
      onRemoveReaction(message.id, emoji);
    }
  };

  return (
    <div
      className={`group flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors ${
        isReply ? 'ml-8' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={message.avatar_url || undefined} />
        <AvatarFallback>
          {message.username?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-sm font-medium text-white">
            {message.username || 'Unknown User'}
          </span>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
          {message.status && (
            <Badge variant="outline" className="text-xs">
              {message.status}
            </Badge>
          )}
        </div>

        {message.content && (
          <p className="text-sm text-gray-300 mb-2 break-words">
            {message.content}
          </p>
        )}

        {message.attachment_url && (
          <AttachmentPreview url={message.attachment_url} />
        )}

        {reactions.length > 0 && (
          <MessageReactions
            reactions={reactions}
            onRemoveReaction={handleRemoveReaction}
            className="mt-2"
          />
        )}
      </div>

      <div className="flex items-center space-x-1">
        {showActions && (
          <>
            <MessageReactionsPicker onAddReaction={handleAddReaction} />
            {!isReply && onReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onReply(message)}
              >
                <Reply className="h-3 w-3" />
              </Button>
            )}
          </>
        )}

        {isOwnMessage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(message.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default EnhancedMessageItem;
