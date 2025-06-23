
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/messaging';

export const useMessageStatus = (conversationId: string) => {
  const { user } = useAuth();
  const [messageStatuses, setMessageStatuses] = useState<Record<string, 'sent' | 'delivered' | 'read'>>({});

  // Update message status
  const updateMessageStatus = useCallback(async (messageId: string, status: 'delivered' | 'read') => {
    if (!user) return;

    try {
      await supabase.rpc('update_message_status', {
        _message_id: messageId,
        _status: status
      });
      
      setMessageStatuses(prev => ({ ...prev, [messageId]: status }));
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  }, [user]);

  // Mark messages as delivered when conversation is viewed
  const markMessagesAsDelivered = useCallback(async (messages: Message[]) => {
    if (!user) return;

    const undeliveredMessages = messages.filter(
      msg => msg.sender_id !== user.id && msg.status === 'sent'
    );

    for (const message of undeliveredMessages) {
      await updateMessageStatus(message.id, 'delivered');
    }
  }, [user, updateMessageStatus]);

  // Mark messages as read when they come into view
  const markMessagesAsRead = useCallback(async (messages: Message[]) => {
    if (!user || document.visibilityState !== 'visible') return;

    const unreadMessages = messages.filter(
      msg => msg.sender_id !== user.id && msg.status !== 'read'
    );

    for (const message of unreadMessages) {
      await updateMessageStatus(message.id, 'read');
    }
  }, [user, updateMessageStatus]);

  // Listen for real-time status updates
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`message-status-${conversationId}`)
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const messageId = payload.new.id;
          const status = payload.new.status as 'sent' | 'delivered' | 'read';
          setMessageStatuses(prev => ({ ...prev, [messageId]: status }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return {
    messageStatuses,
    updateMessageStatus,
    markMessagesAsDelivered,
    markMessagesAsRead
  };
};
