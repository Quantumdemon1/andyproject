
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addMessageReaction, removeMessageReaction, fetchMessageReactions } from '@/api/messageApi';
import { toast } from '@/components/ui/use-toast';

interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

interface ReactionSummary {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

export const useMessageReactions = (messageId: string) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReactions = async () => {
    try {
      setLoading(true);
      const data = await fetchMessageReactions(messageId);
      setReactions(data);
    } catch (error) {
      console.error('Error loading reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messageId) {
      loadReactions();
    }
  }, [messageId]);

  const addReaction = async (emoji: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be signed in to add reactions.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await addMessageReaction(messageId, user.id, emoji);
      await loadReactions(); // Refresh reactions
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const removeReaction = async (emoji: string) => {
    if (!user) return;

    try {
      await removeMessageReaction(messageId, user.id, emoji);
      await loadReactions(); // Refresh reactions
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const reactionSummary: ReactionSummary[] = reactions.reduce((acc, reaction) => {
    const existing = acc.find(r => r.emoji === reaction.emoji);
    const hasReacted = user ? reaction.user_id === user.id : false;

    if (existing) {
      existing.count++;
      if (hasReacted) existing.hasReacted = true;
    } else {
      acc.push({
        emoji: reaction.emoji,
        count: 1,
        hasReacted
      });
    }

    return acc;
  }, [] as ReactionSummary[]);

  return {
    reactions: reactionSummary,
    addReaction,
    removeReaction,
    loading
  };
};
