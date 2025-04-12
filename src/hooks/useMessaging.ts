
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation, Message } from '@/types/messaging';
import { fetchConversations, togglePinConversation as togglePin } from '@/api/conversationApi';
import { fetchMessages, sendMessage as sendMsg, deleteMessage as deleteMsg } from '@/api/messageApi';

export function useMessaging() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinnedConversations, setPinnedConversations] = useState<string[]>([]);

  // Fetch conversations
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
      setLoading(false);
      return;
    }

    const loadConversations = async () => {
      try {
        setLoading(true);
        const conversationsData = await fetchConversations(user.id);
        setConversations(conversationsData);
        
        // Update pinned conversations
        const pinnedIds = conversationsData
          .filter(conv => conv.isPinned)
          .map(conv => conv.id);
        setPinnedConversations(pinnedIds);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    // Set up real-time subscription for conversations
    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'conversations' },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    // Set up real-time subscription for messages
    const messagesChannel = supabase
      .channel('messages-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    // Set up real-time subscription for pinned conversations
    const pinnedChannel = supabase
      .channel('pinned-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pinned_conversations' },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(pinnedChannel);
    };
  }, [user]);

  // Fetch messages when current conversation changes
  useEffect(() => {
    if (!currentConversation || !user) return;

    const loadMessages = async () => {
      const messagesData = await fetchMessages(currentConversation.id, user.id);
      setMessages(messagesData);
    };

    loadMessages();

    // Subscribe to message changes for the current conversation
    const messagesChannel = supabase
      .channel(`messages-${currentConversation.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${currentConversation.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Add new message
            const newMessage = {
              ...payload.new,
              // Ensure proper typing
              status: (payload.new.status as 'sent' | 'delivered' | 'read') || 'sent',
              isMe: payload.new.sender_id === user.id
            } as Message;

            // Mark message as delivered if it's from someone else
            if (payload.new.sender_id !== user.id && payload.new.status === 'sent') {
              supabase.rpc('update_message_status', {
                _message_id: payload.new.id,
                _status: 'delivered'
              });
            }

            // Mark message as read if we're currently viewing the conversation
            if (payload.new.sender_id !== user.id && document.visibilityState === 'visible') {
              supabase.rpc('update_message_status', {
                _message_id: payload.new.id,
                _status: 'read'
              });
            }

            setMessages(prev => [...prev, newMessage]);
          } else if (payload.eventType === 'UPDATE') {
            // Update existing message
            setMessages(prev => 
              prev.map(msg => 
                msg.id === payload.new.id 
                  ? { 
                      ...payload.new, 
                      status: (payload.new.status as 'sent' | 'delivered' | 'read') || 'sent',
                      isMe: payload.new.sender_id === user.id 
                    } as Message
                  : msg
              )
            );
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted message
            setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [currentConversation, user]);

  const sendMessage = async (content: string, attachmentUrl?: string) => {
    if (!user || !currentConversation) return;
    await sendMsg(currentConversation.id, user.id, content, attachmentUrl);
  };

  const togglePinConversation = async (conversationId: string) => {
    if (!user) return;

    try {
      const isPinned = pinnedConversations.includes(conversationId);
      const newPinnedState = await togglePin(user.id, conversationId, isPinned);
      
      // Update local pinned conversations state
      if (newPinnedState) {
        setPinnedConversations(prev => [...prev, conversationId]);
      } else {
        setPinnedConversations(prev => prev.filter(id => id !== conversationId));
      }

      // Update conversations state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, isPinned: newPinnedState } 
            : conv
        )
      );
    } catch (error) {
      // Error is already handled in the API function
      console.error("Error in togglePinConversation:", error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!user) return;
    await deleteMsg(messageId, user.id);
    // Remove message from local state
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    setCurrentConversation,
    sendMessage,
    togglePinConversation,
    deleteMessage,
    pinnedConversations
  };
}

// Re-export the types
export type { Message, Conversation, UserProfile } from '@/types/messaging';
