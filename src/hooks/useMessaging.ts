
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  status: 'sent' | 'delivered' | 'read';
  attachment_url?: string;
  isMe?: boolean; // Computed locally
}

export interface Conversation {
  id: string;
  name: string;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  is_online?: boolean;
  participants?: {
    id: string;
    user_id: string;
    username?: string;
    avatar_url?: string;
    is_online?: boolean;
  }[];
  lastMessage?: {
    content: string;
    created_at: string;
    status: string;
  };
  isPinned?: boolean; // Calculated locally
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  is_online: boolean;
  last_seen: string;
}

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

    const fetchConversations = async () => {
      try {
        setLoading(true);

        // Fetch conversations the user is part of
        const { data: participantData, error: participantError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id);

        if (participantError) throw participantError;

        const conversationIds = participantData.map(p => p.conversation_id);
        if (conversationIds.length === 0) {
          setConversations([]);
          setLoading(false);
          return;
        }

        // Fetch conversations details
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('conversations')
          .select(`
            *,
            conversation_participants!inner(user_id)
          `)
          .in('id', conversationIds);

        if (conversationsError) throw conversationsError;

        // Fetch pinned conversations
        const { data: pinnedData, error: pinnedError } = await supabase
          .from('pinned_conversations')
          .select('conversation_id')
          .eq('user_id', user.id);

        if (pinnedError) throw pinnedError;
        
        const pinnedIds = pinnedData.map(p => p.conversation_id);
        setPinnedConversations(pinnedIds);

        // Fetch last message for each conversation
        const enrichedConversations = await Promise.all(
          conversationsData.map(async (conv) => {
            // Get last message
            const { data: lastMessageData, error: lastMessageError } = await supabase
              .from('messages')
              .select('content, created_at, status')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1);

            if (lastMessageError) throw lastMessageError;
            
            const lastMessage = lastMessageData?.[0] || null;

            // Get participants
            const { data: participantsData, error: participantsError } = await supabase
              .from('conversation_participants')
              .select(`
                id,
                user_id,
                user_profiles!inner(username, avatar_url, is_online)
              `)
              .eq('conversation_id', conv.id);

            if (participantsError) throw participantsError;

            // Format participants
            const participants = participantsData.map(p => ({
              id: p.id,
              user_id: p.user_id,
              username: p.user_profiles?.username,
              avatar_url: p.user_profiles?.avatar_url,
              is_online: p.user_profiles?.is_online
            }));

            // For direct messages, use the other user's profile for display
            let name = conv.name;
            let avatar_url;
            let is_online = false;
            
            if (!conv.is_group) {
              const otherUser = participants.find(p => p.user_id !== user.id);
              if (otherUser) {
                name = name || otherUser.username || 'User';
                avatar_url = otherUser.avatar_url;
                is_online = otherUser.is_online || false;
              }
            } else {
              // Group chat - use first 2 avatars or default
              avatar_url = participants[0]?.avatar_url;
            }

            return {
              ...conv,
              name,
              avatar_url,
              is_online,
              participants,
              lastMessage,
              isPinned: pinnedIds.includes(conv.id)
            };
          })
        );

        // Sort conversations by latest message
        enrichedConversations.sort((a, b) => {
          const aDate = a.lastMessage?.created_at || a.updated_at;
          const bDate = b.lastMessage?.created_at || b.updated_at;
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        });

        setConversations(enrichedConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load conversations',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Set up real-time subscription for conversations
    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'conversations' },
        (payload) => {
          fetchConversations();
        }
      )
      .subscribe();

    // Set up real-time subscription for messages
    const messagesChannel = supabase
      .channel('messages-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          fetchConversations();
        }
      )
      .subscribe();

    // Set up real-time subscription for pinned conversations
    const pinnedChannel = supabase
      .channel('pinned-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pinned_conversations' },
        (payload) => {
          fetchConversations();
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

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', currentConversation.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Mark messages as read
        const unreadMessages = data.filter(
          m => m.sender_id !== user.id && m.status !== 'read'
        );
        
        if (unreadMessages.length > 0) {
          unreadMessages.forEach(async (message) => {
            await supabase.rpc('update_message_status', {
              _message_id: message.id,
              _status: 'read'
            });
          });
        }

        // Add isMe flag to messages
        const formattedMessages = data.map(message => ({
          ...message,
          isMe: message.sender_id === user.id
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load messages',
          variant: 'destructive'
        });
      }
    };

    fetchMessages();

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
              isMe: payload.new.sender_id === user.id
            };

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
                  ? { ...payload.new, isMe: payload.new.sender_id === user.id }
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

    try {
      const newMessage = {
        conversation_id: currentConversation.id,
        sender_id: user.id,
        content,
        attachment_url: attachmentUrl,
      };

      const { error } = await supabase.from('messages').insert(newMessage);
      
      if (error) throw error;

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Message not sent',
        description: 'There was an error sending your message',
        variant: 'destructive'
      });
    }
  };

  const togglePinConversation = async (conversationId: string) => {
    if (!user) return;

    try {
      const isPinned = pinnedConversations.includes(conversationId);
      
      if (isPinned) {
        // Unpin the conversation
        const { error } = await supabase
          .from('pinned_conversations')
          .delete()
          .eq('conversation_id', conversationId)
          .eq('user_id', user.id);

        if (error) throw error;

        setPinnedConversations(prev => prev.filter(id => id !== conversationId));
      } else {
        // Pin the conversation
        const { error } = await supabase
          .from('pinned_conversations')
          .insert({
            conversation_id: conversationId,
            user_id: user.id
          });

        if (error) throw error;

        setPinnedConversations(prev => [...prev, conversationId]);
      }

      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, isPinned: !isPinned } 
            : conv
        )
      );

    } catch (error) {
      console.error('Error toggling pin:', error);
      toast({
        title: 'Error',
        description: 'Failed to update pinned conversation',
        variant: 'destructive'
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;

      // Remove message from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));

    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive'
      });
    }
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
