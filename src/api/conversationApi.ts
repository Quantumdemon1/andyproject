
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Conversation } from '@/types/messaging';

export async function fetchConversations(userId: string) {
  try {
    // Fetch conversations the user is part of
    const { data: participantData, error: participantError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (participantError) throw participantError;

    const conversationIds = participantData.map(p => p.conversation_id);
    if (conversationIds.length === 0) {
      return [];
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
      .eq('user_id', userId);

    if (pinnedError) throw pinnedError;
    
    const pinnedIds = pinnedData.map(p => p.conversation_id);

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
            user_profiles:user_id(username, avatar_url, is_online)
          `)
          .eq('conversation_id', conv.id);

        if (participantsError) throw participantsError;

        // Format participants
        const participants = participantsData.map(p => {
          // Safely access nested properties
          const userProfile = p.user_profiles;
                
          return {
            id: p.id,
            user_id: p.user_id,
            username: userProfile?.username,
            avatar_url: userProfile?.avatar_url,
            is_online: userProfile?.is_online || false
          };
        });

        // For direct messages, use the other user's profile for display
        let name = conv.name;
        let avatar_url;
        let is_online = false;
        
        if (!conv.is_group) {
          const otherUser = participants.find(p => p.user_id !== userId);
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

    return enrichedConversations;
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

export async function togglePinConversation(userId: string, conversationId: string, isPinned: boolean) {
  try {
    if (isPinned) {
      // Unpin the conversation
      const { error } = await supabase
        .from('pinned_conversations')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (error) throw error;
      return false;
    } else {
      // Pin the conversation
      const { error } = await supabase
        .from('pinned_conversations')
        .insert({
          conversation_id: conversationId,
          user_id: userId
        });

      if (error) throw error;
      return true;
    }
  } catch (error) {
    console.error('Error toggling pin:', error);
    toast({
      title: 'Error',
      description: 'Failed to update pinned conversation',
      variant: 'destructive'
    });
    throw error;
  }
}
