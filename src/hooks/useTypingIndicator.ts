
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TypingUser {
  user_id: string;
  username: string;
  avatar_url?: string;
}

export const useTypingIndicator = (conversationId: string) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const startTyping = useCallback(async () => {
    if (!user || !conversationId) return;

    setIsTyping(true);
    
    const channel = supabase.channel(`conversation-${conversationId}-typing`);
    await channel.track({
      user_id: user.id,
      username: user.user_metadata?.username || 'Unknown',
      avatar_url: user.user_metadata?.avatar_url,
      typing: true
    });
  }, [user, conversationId]);

  const stopTyping = useCallback(async () => {
    if (!user || !conversationId) return;

    setIsTyping(false);
    
    const channel = supabase.channel(`conversation-${conversationId}-typing`);
    await channel.untrack();
  }, [user, conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation-${conversationId}-typing`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typing = Object.values(state).flat()
          .filter((presence: any) => presence.typing && presence.user_id !== user?.id)
          .map((presence: any) => ({
            user_id: presence.user_id,
            username: presence.username,
            avatar_url: presence.avatar_url
          }));
        setTypingUsers(typing);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id]);

  return {
    typingUsers,
    isTyping,
    startTyping,
    stopTyping
  };
};
