
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Conversation } from '@/types/messaging';

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  try {
    // Use the optimized function to fetch all conversation data in one query
    const { data, error } = await supabase.rpc('get_user_conversations', {
      user_uuid: userId
    });

    if (error) throw error;

    // Transform the data to match our Conversation type
    const conversations: Conversation[] = data.map((row: any) => ({
      id: row.conversation_id,
      name: row.conversation_name,
      isGroup: row.is_group,
      createdAt: row.conversation_created_at,
      updatedAt: row.conversation_updated_at,
      participants: [{
        id: userId,
        username: 'You',
        avatarUrl: '',
        isOnline: true
      }],
      otherParticipant: row.other_participant_username ? {
        id: 'other-user',
        username: row.other_participant_username,
        avatarUrl: row.other_participant_avatar_url,
        isOnline: row.other_participant_is_online
      } : undefined,
      lastMessage: row.last_message_content ? {
        content: row.last_message_content,
        created_at: row.last_message_created_at,
        status: row.last_message_status as 'sent' | 'delivered' | 'read'
      } : undefined,
      isPinned: false // This will be set by the pinned conversations logic
    }));

    return conversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    toast({
      title: 'Error',
      description: 'Failed to load conversations',
      variant: 'destructive'
    });
    return [];
  }
}

export async function togglePinConversation(
  userId: string, 
  conversationId: string, 
  isPinned: boolean
): Promise<boolean> {
  try {
    if (isPinned) {
      // Unpin the conversation
      const { error } = await supabase
        .from('pinned_conversations')
        .delete()
        .eq('user_id', userId)
        .eq('conversation_id', conversationId);
      
      if (error) throw error;
      return false;
    } else {
      // Pin the conversation
      const { error } = await supabase
        .from('pinned_conversations')
        .insert({
          user_id: userId,
          conversation_id: conversationId
        });
      
      if (error) throw error;
      return true;
    }
  } catch (error) {
    console.error('Error toggling pin status:', error);
    toast({
      title: 'Error',
      description: 'Failed to update conversation pin status',
      variant: 'destructive'
    });
    throw error;
  }
}
