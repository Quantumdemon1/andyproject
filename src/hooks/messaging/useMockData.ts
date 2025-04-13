
import { Conversation, Message } from '@/types/messaging';

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

export const useMockData = () => {
  return {
    mockConversations,
    mockMessages
  };
};
