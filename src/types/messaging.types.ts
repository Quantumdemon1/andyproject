
import { Message, Conversation, UserProfile } from './messaging';

// Re-export the base types
export type { Message, Conversation, UserProfile };

export interface MessagingHookReturn {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  setCurrentConversation: (conversation: Conversation | null) => void;
  sendMessage: (content: string, attachmentUrl?: string) => Promise<void>;
  togglePinConversation: (conversationId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  pinnedConversations: string[];
}

export interface MessagingState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  pinnedConversations: string[];
}
