
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { addMessageReaction, removeMessageReaction, fetchMessageReactions } from '@/api/messageApi';
import { MessageReaction } from '@/types/messaging';
import { useAuth } from '@/contexts/AuthContext';
import EmojiPicker from '@/components/EmojiPicker';

interface ReactionSummary {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface MessageReactionsProps {
  messageId?: string;
  reactions?: ReactionSummary[];
  onRemoveReaction?: (emoji: string) => void;
  className?: string;
}

const MessageReactions: React.FC<MessageReactionsProps> = ({ 
  messageId, 
  reactions: propReactions,
  onRemoveReaction,
  className 
}) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (messageId) {
      loadReactions();
    }
  }, [messageId]);

  const loadReactions = async () => {
    if (!messageId) return;
    const messageReactions = await fetchMessageReactions(messageId);
    setReactions(messageReactions as MessageReaction[]);
  };

  // Use prop reactions if provided, otherwise compute from loaded reactions
  const displayReactions = propReactions || reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        hasReacted: false,
      };
    }
    acc[reaction.emoji].count++;
    if (reaction.user_id === user?.id) {
      acc[reaction.emoji].hasReacted = true;
    }
    return acc;
  }, {} as Record<string, ReactionSummary>);

  const reactionArray = Array.isArray(displayReactions) 
    ? displayReactions 
    : Object.values(displayReactions);

  const handleReactionClick = async (emoji: string, hasUserReacted: boolean) => {
    if (!user || !messageId) return;

    try {
      if (hasUserReacted) {
        if (onRemoveReaction) {
          onRemoveReaction(emoji);
        } else {
          await removeMessageReaction(messageId, user.id, emoji);
          loadReactions();
        }
      } else {
        await addMessageReaction(messageId, user.id, emoji);
        loadReactions();
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const handleEmojiSelect = async (emoji: string) => {
    if (!user || !messageId) return;
    
    try {
      await addMessageReaction(messageId, user.id, emoji);
      setShowEmojiPicker(false);
      loadReactions();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  if (reactionArray.length === 0 && !showEmojiPicker) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1 mt-1 ${className}`}>
      {reactionArray.map(({ emoji, count, hasReacted }) => (
        <Button
          key={emoji}
          variant={hasReacted ? "default" : "outline"}
          size="sm"
          className={`h-6 px-2 text-xs rounded-full ${
            hasReacted 
              ? 'bg-aura-purple/20 border-aura-purple text-aura-purple' 
              : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
          }`}
          onClick={() => handleReactionClick(emoji, hasReacted)}
        >
          <span className="mr-1">{emoji}</span>
          <span>{count}</span>
        </Button>
      ))}
      
      {messageId && (
        <EmojiPicker onEmojiSelect={handleEmojiSelect}>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 rounded-full text-gray-400 hover:text-gray-200 hover:bg-white/10"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </EmojiPicker>
      )}
    </div>
  );
};

export default MessageReactions;
