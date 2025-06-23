
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, Conversation } from '@/types/messaging';
import { fetchMessages, sendMessage as sendMsg, deleteMessage as deleteMsg } from '@/api/messageApi';
import { isDirectAccessEnabled } from '@/utils/authUtils';
import { useMockData } from './useMockData';

export const useMessagesData = (
  currentConversation: Conversation | null,
  userId: string | undefined,
  setConversations: (conversations: (prev: Conversation[]) => Conversation[]) => void
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { mockMessages } = useMockData();
  const directAccessMode = isDirectAccessEnabled();

  // Fetch messages when current conversation changes
  useEffect(() => {
    if (!currentConversation || !userId) return;

    const loadMessages = async () => {
      if (directAccessMode) {
        // Use mock messages in direct access mode
        console.log("Direct access mode: using mock messages");
        const mockConvMessages = mockMessages[currentConversation.id] || [];
        setMessages(mockConvMessages);
        return;
      }
      
      try {
        const messagesData = await fetchMessages(currentConversation.id, userId);
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
              isMe: payload.new.sender_id === userId
            } as Message;

            // Mark message as delivered if it's from someone else
            if (payload.new.sender_id !== userId && payload.new.status === 'sent') {
              supabase.rpc('update_message_status', {
                _message_id: payload.new.id,
                _status: 'delivered'
              });
            }

            // Mark message as read if we're currently viewing the conversation
            if (payload.new.sender_id !== userId && document.visibilityState === 'visible') {
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
                      isMe: payload.new.sender_id === userId 
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
  }, [currentConversation, userId, directAccessMode, mockMessages]);

  const sendMessage = async (
    content: string, 
    attachmentUrl?: string,
    replyToMessageId?: string,
    threadId?: string
  ) => {
    if (!userId || !currentConversation) return;
    
    if (directAccessMode) {
      console.log("Direct access mode: simulating message send");
      const newMessage: Message = {
        id: `mock-${Date.now()}`,
        content,
        sender_id: userId,
        conversation_id: currentConversation.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'sent',
        attachment_url: attachmentUrl,
        reply_to_message_id: replyToMessageId,
        thread_id: threadId,
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
    
    await sendMsg(currentConversation.id, userId, content, attachmentUrl, replyToMessageId, threadId);
  };

  const deleteMessage = async (messageId: string) => {
    if (!userId) return;
    
    // Handle direct access mode
    if (directAccessMode) {
      console.log("Direct access mode: simulating message delete");
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      return;
    }
    
    await deleteMsg(messageId, userId);
    // Remove message from local state
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  return {
    messages,
    sendMessage,
    deleteMessage
  };
};
