
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/use-debounce';

interface TypingUser {
  userId: string;
  username: string;
  avatar?: string;
}

export const useTypingIndicator = (conversationId: string, currentUserId: string) => {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const debouncedIsTyping = useDebounce(isTyping, 1000);

  const channel = supabase.channel(`typing:${conversationId}`);

  useEffect(() => {
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: TypingUser[] = [];
        
        Object.keys(state).forEach(key => {
          const presences = state[key];
          presences.forEach((presence: any) => {
            if (presence.userId !== currentUserId && presence.isTyping) {
              users.push({
                userId: presence.userId,
                username: presence.username,
                avatar: presence.avatar
              });
            }
          });
        });
        
        setTypingUsers(users);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    if (debouncedIsTyping !== isTyping) {
      setIsTyping(false);
    }
  }, [debouncedIsTyping]);

  const startTyping = useCallback((username: string, avatar?: string) => {
    setIsTyping(true);
    channel.track({
      userId: currentUserId,
      username,
      avatar,
      isTyping: true
    });
  }, [currentUserId, channel]);

  const stopTyping = useCallback(() => {
    setIsTyping(false);
    channel.track({
      userId: currentUserId,
      isTyping: false
    });
  }, [currentUserId, channel]);

  return {
    typingUsers,
    startTyping,
    stopTyping
  };
};
