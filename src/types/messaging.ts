
export interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  status: 'sent' | 'delivered' | 'read';
  attachment_url?: string;
  isMe?: boolean; // Computed locally
  updated_at: string;
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
