
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { addMessageReaction, removeMessageReaction, fetchMessageReactions } from '@/api/messageApi';
import { MessageReaction } from '@/types/messaging';
import { useAuth } from '@/contexts/AuthContext';
import EmojiPicker from '@/components/EmojiPicker';

interface MessageReactionsProps {
  messageId: string;
  className?: string;
}

const MessageReactions: React.FC<MessageReactionsProps> = ({ messageId, className }) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    loadReactions();
  }, [messageId]);

  const loadReactions = async () => {
    const messageReactions = await fetchMessageReactions(messageId);
    setReactions(messageReactions);
  };

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        hasUserReacted: false,
        users: []
      };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push(reaction.user_id);
    if (reaction.user_id === user?.id) {
      acc[reaction.emoji].hasUserReacted = true;
    }
    return acc;
  }, {} as Record<string, { emoji: string; count: number; hasUserReacted: boolean; users: string[] }>);

  const handleReactionClick = async (emoji: string, hasUserReacted: boolean) => {
    if (!user) return;

    try {
      if (hasUserReacted) {
        await removeMessageReaction(messageId, user.id, emoji);
      } else {
        await addMessageReaction(messageId, user.id, emoji);
      }
      loadReactions();
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const handleEmojiSelect = async (emoji: string) => {
    if (!user) return;
    
    try {
      await addMessageReaction(messageId, user.id, emoji);
      setShowEmojiPicker(false);
      loadReactions();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  if (Object.keys(groupedReactions).length === 0 && !showEmojiPicker) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1 mt-1 ${className}`}>
      {Object.values(groupedReactions).map(({ emoji, count, hasUserReacted }) => (
        <Button
          key={emoji}
          variant={hasUserReacted ? "default" : "outline"}
          size="sm"
          className={`h-6 px-2 text-xs rounded-full ${
            hasUserReacted 
              ? 'bg-aura-purple/20 border-aura-purple text-aura-purple' 
              : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
          }`}
          onClick={() => handleReactionClick(emoji, hasUserReacted)}
        >
          <span className="mr-1">{emoji}</span>
          <span>{count}</span>
        </Button>
      ))}
      
      <EmojiPicker onEmojiSelect={handleEmojiSelect}>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 rounded-full text-gray-400 hover:text-gray-200 hover:bg-white/10"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </EmojiPicker>
    </div>
  );
};

export default MessageReactions;
