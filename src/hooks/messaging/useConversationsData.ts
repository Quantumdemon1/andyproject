
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Conversation } from '@/types/messaging';
import { fetchConversations, togglePinConversation as togglePin } from '@/api/conversationApi';
import { isDirectAccessEnabled } from '@/utils/authUtils';
import { useMockData } from './useMockData';

export const useConversationsData = (userId: string | undefined) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinnedConversations, setPinnedConversations] = useState<string[]>([]);
  const { mockConversations } = useMockData();
  const directAccessMode = isDirectAccessEnabled();

  useEffect(() => {
    if (!userId) {
      setConversations([]);
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
        
        const conversationsData = await fetchConversations(userId);
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
  }, [userId, directAccessMode, mockConversations]);

  const togglePinConversation = async (conversationId: string) => {
    if (!userId) return;

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
      const newPinnedState = await togglePin(userId, conversationId, isPinned);
      
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

  return {
    conversations,
    loading,
    pinnedConversations,
    setConversations,
    togglePinConversation
  };
};
