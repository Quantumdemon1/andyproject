
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation, Message } from '@/types/messaging';
import { fetchConversations, togglePinConversation as togglePin } from '@/api/conversationApi';
import { fetchMessages, sendMessage as sendMsg, deleteMessage as deleteMsg } from '@/api/messageApi';
import { isDirectAccessEnabled } from '@/utils/authUtils';

// Mock data for direct access mode
const mockConversations: Conversation[] = [
  {
    id: 'mock-conv-1',
    name: 'Jane Smith',
    is_group: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
    is_online: true,
    lastMessage: {
      content: 'Hey there! How are you?',
      created_at: new Date().toISOString(),
      status: 'read'
    },
    isPinned: true
  },
  {
    id: 'mock-conv-2',
    name: 'Team Chat',
    is_group: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=team',
    lastMessage: {
      content: 'Let\'s meet tomorrow at 10am',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      status: 'delivered'
    },
    isPinned: false
  }
];

const mockMessages: Record<string, Message[]> = {
  'mock-conv-1': [
    {
      id: 'msg1',
      content: 'Hey there! How are you?',
      sender_id: 'other-user',
      conversation_id: 'mock-conv-1',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      status: 'read',
      updated_at: new Date(Date.now() - 3600000).toISOString(),
      isMe: false
    },
    {
      id: 'msg2',
      content: 'I\'m good, thanks for asking!',
      sender_id: 'direct-access-user',
      conversation_id: 'mock-conv-1',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      status: 'read',
      updated_at: new Date(Date.now() - 1800000).toISOString(),
      isMe: true
    }
  ],
  'mock-conv-2': [
    {
      id: 'msg3',
      content: 'Welcome everyone to the team chat',
      sender_id: 'other-user-1',
      conversation_id: 'mock-conv-2',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      status: 'read',
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      isMe: false
    },
    {
      id: 'msg4',
      content: 'Let\'s meet tomorrow at 10am',
      sender_id: 'other-user-2',
      conversation_id: 'mock-conv-2',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      status: 'delivered',
      updated_at: new Date(Date.now() - 3600000).toISOString(),
      isMe: false
    }
  ]
};

export function useMessaging() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinnedConversations, setPinnedConversations] = useState<string[]>([]);
  const directAccessMode = isDirectAccessEnabled();

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
        
        if (directAccessMode) {
          // Use mock data in direct access mode
          console.log("Direct access mode: using mock conversations");
          setConversations(mockConversations);
          setPinnedConversations(mockConversations.filter(c => c.isPinned).map(c => c.id));
          setLoading(false);
          return;
        }
        
        const conversationsData = await fetchConversations(user.id);
        setConversations(conversationsData);
        
        // Update pinned conversations
        const pinnedIds = conversationsData
          .filter(conv => conv.isPinned)
          .map(conv => conv.id);
        setPinnedConversations(pinnedIds);
      } catch (error) {
        console.error("Error loading conversations:", error);
        // Fallback to mock data if we encounter errors
        if (!directAccessMode) {
          console.log("Error loading conversations, falling back to mock data");
          setConversations(mockConversations);
          setPinnedConversations(mockConversations.filter(c => c.isPinned).map(c => c.id));
        }
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    // Skip real-time subscription in direct access mode
    if (directAccessMode) return;

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
      if (!directAccessMode) {
        supabase.removeChannel(conversationsChannel);
        supabase.removeChannel(messagesChannel);
        supabase.removeChannel(pinnedChannel);
      }
    };
  }, [user, directAccessMode]);

  // Fetch messages when current conversation changes
  useEffect(() => {
    if (!currentConversation || !user) return;

    const loadMessages = async () => {
      if (directAccessMode) {
        // Use mock messages in direct access mode
        console.log("Direct access mode: using mock messages");
        const mockConvMessages = mockMessages[currentConversation.id] || [];
        setMessages(mockConvMessages);
        return;
      }
      
      try {
        const messagesData = await fetchMessages(currentConversation.id, user.id);
        setMessages(messagesData);
      } catch (error) {
        console.error("Error loading messages:", error);
        // Fallback to mock data if we encounter errors
        if (currentConversation.id in mockMessages) {
          setMessages(mockMessages[currentConversation.id]);
        } else {
          setMessages([]);
        }
      }
    };

    loadMessages();

    // Skip real-time subscription in direct access mode
    if (directAccessMode) return;

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
      if (!directAccessMode) {
        supabase.removeChannel(messagesChannel);
      }
    };
  }, [currentConversation, user, directAccessMode]);

  const sendMessage = async (content: string, attachmentUrl?: string) => {
    if (!user || !currentConversation) return;
    
    if (directAccessMode) {
      console.log("Direct access mode: simulating message send");
      const newMessage: Message = {
        id: `mock-${Date.now()}`,
        content,
        sender_id: user.id,
        conversation_id: currentConversation.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'sent',
        attachment_url: attachmentUrl,
        isMe: true
      };
      
      // Add message to the current conversation
      setMessages(prev => [...prev, newMessage]);
      
      // Update the conversation's last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversation.id 
            ? {
                ...conv,
                lastMessage: {
                  content,
                  created_at: new Date().toISOString(),
                  status: 'sent'
                }
              }
            : conv
        )
      );
      return;
    }
    
    await sendMsg(currentConversation.id, user.id, content, attachmentUrl);
  };

  const togglePinConversation = async (conversationId: string) => {
    if (!user) return;

    try {
      // Handle direct access mode
      if (directAccessMode) {
        console.log("Direct access mode: simulating pin toggle");
        const isPinned = pinnedConversations.includes(conversationId);
        
        // Update local pinned conversations state
        if (!isPinned) {
          setPinnedConversations(prev => [...prev, conversationId]);
        } else {
          setPinnedConversations(prev => prev.filter(id => id !== conversationId));
        }
        
        // Update conversations state
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, isPinned: !isPinned } 
              : conv
          )
        );
        return;
      }
      
      // Normal mode with database operations
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
    
    // Handle direct access mode
    if (directAccessMode) {
      console.log("Direct access mode: simulating message delete");
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      return;
    }
    
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
