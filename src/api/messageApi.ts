
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Message } from '@/types/messaging';

export async function fetchMessages(conversationId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Mark messages as read
    const unreadMessages = data.filter(
      m => m.sender_id !== userId && m.status !== 'read'
    );
    
    if (unreadMessages.length > 0) {
      unreadMessages.forEach(async (message) => {
        await supabase.rpc('update_message_status', {
          _message_id: message.id,
          _status: 'read'
        });
      });
    }

    // Add isMe flag to messages and ensure proper type casting
    const formattedMessages: Message[] = data.map(message => ({
      ...message,
      // Ensure status is one of the allowed values
      status: (message.status as 'sent' | 'delivered' | 'read') || 'sent',
      isMe: message.sender_id === userId
    }));

    return formattedMessages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    toast({
      title: 'Error',
      description: 'Failed to load messages',
      variant: 'destructive'
    });
    return [];
  }
}

export async function sendMessage(
  conversationId: string, 
  userId: string, 
  content: string, 
  attachmentUrl?: string,
  replyToMessageId?: string,
  threadId?: string
) {
  try {
    const newMessage = {
      conversation_id: conversationId,
      sender_id: userId,
      content,
      attachment_url: attachmentUrl,
      reply_to_message_id: replyToMessageId,
      thread_id: threadId,
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
    throw error;
  }
}

export async function deleteMessage(messageId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting message:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete message',
      variant: 'destructive'
    });
    throw error;
  }
}

export async function addMessageReaction(messageId: string, userId: string, emoji: string) {
  try {
    // Use type assertion to bypass TypeScript errors since the table exists
    const { error } = await (supabase as any)
      .from('message_reactions')
      .insert({
        message_id: messageId,
        user_id: userId,
        emoji
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error adding reaction:', error);
    toast({
      title: 'Error',
      description: 'Failed to add reaction',
      variant: 'destructive'
    });
    throw error;
  }
}

export async function removeMessageReaction(messageId: string, userId: string, emoji: string) {
  try {
    // Use type assertion to bypass TypeScript errors since the table exists
    const { error } = await (supabase as any)
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('emoji', emoji);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing reaction:', error);
    toast({
      title: 'Error',
      description: 'Failed to remove reaction',
      variant: 'destructive'
    });
    throw error;
  }
}

export async function fetchMessageReactions(messageId: string) {
  try {
    // Use type assertion to bypass TypeScript errors since the table exists
    const { data, error } = await (supabase as any)
      .from('message_reactions')
      .select('*')
      .eq('message_id', messageId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return [];
  }
}
