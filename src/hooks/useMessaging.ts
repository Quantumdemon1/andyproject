
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation } from '@/types/messaging';
import { MessagingHookReturn } from '@/types/messaging.types';
import { useConversationsData } from './messaging/useConversationsData';
import { useMessagesData } from './messaging/useMessagesData';

export function useMessaging(): MessagingHookReturn {
  const { user } = useAuth();
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  
  const {
    conversations,
    loading,
    pinnedConversations,
    setConversations,
    togglePinConversation
  } = useConversationsData(user?.id);

  const {
    messages,
    sendMessage,
    deleteMessage
  } = useMessagesData(currentConversation, user?.id, setConversations);

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
