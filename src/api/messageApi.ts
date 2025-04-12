
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
  attachmentUrl?: string
) {
  try {
    const newMessage = {
      conversation_id: conversationId,
      sender_id: userId,
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
