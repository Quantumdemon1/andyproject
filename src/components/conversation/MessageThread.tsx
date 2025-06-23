
import React, { useState } from 'react';
import { Message } from '@/types/messaging';
import MessageItem from './MessageItem';
import MessageComposer from './MessageComposer';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageThreadProps {
  parentMessage: Message;
  replies: Message[];
  onSendReply: (content: string, attachmentUrl?: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  currentUserId?: string;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  parentMessage,
  replies,
  onSendReply,
  onDeleteMessage,
  onAddReaction,
  onRemoveReaction,
  currentUserId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReplyComposer, setShowReplyComposer] = useState(false);

  const handleSendReply = async (content: string, attachmentUrl?: string) => {
    await onSendReply(content, attachmentUrl);
    setShowReplyComposer(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    await onDeleteMessage(messageId);
  };

  return (
    <div className="border-l-2 border-aura-purple/20 ml-4 pl-4 mt-2">
      {replies.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mb-2 text-sm text-gray-500 hover:text-white"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 ml-1" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-1" />
          )}
        </Button>
      )}

      {isExpanded && (
        <div className="space-y-2">
          {replies.map((reply) => (
            <MessageItem
              key={reply.id}
              message={reply}
              onDelete={handleDeleteMessage}
              onReply={undefined}
              isReply
            />
          ))}
        </div>
      )}

      <div className="mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowReplyComposer(!showReplyComposer)}
          className="text-sm text-aura-purple hover:text-aura-purple/80"
        >
          Reply to thread
        </Button>

        {showReplyComposer && (
          <div className="mt-2">
            <MessageComposer
              onSendMessage={handleSendReply}
              placeholder="Reply to thread..."
              compact
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageThread;
