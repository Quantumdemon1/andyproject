
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '@/types/messaging';
import { Button } from '@/components/ui/button';
import { Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import MessageList from '@/components/conversation/MessageList';
import EnhancedMessageComposer from '@/components/conversation/EnhancedMessageComposer';
import TypingIndicator from '@/components/conversation/TypingIndicator';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useMessageReactions } from '@/hooks/useMessageReactions';

interface ConversationProps {
  currentChat: any;
  messages: Message[];
  sendMessage: (content: string, attachmentUrl?: string, replyToMessageId?: string) => void;
  deleteMessage: (messageId: string) => void;
  isMobile?: boolean;
  onBack?: () => void;
}

const Conversation: React.FC<ConversationProps> = ({
  currentChat,
  messages,
  sendMessage,
  deleteMessage,
  isMobile = false,
  onBack
}) => {
  const [replyToMessage, setReplyToMessage] = useState<{ id: string; content: string; username: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { typingUsers } = useTypingIndicator(currentChat?.id || '');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const handleSendMessage = (content: string, attachmentUrl?: string, replyToMessageId?: string) => {
    sendMessage(content, attachmentUrl, replyToMessageId);
    setReplyToMessage(null);
  };

  const handleReply = (message: Message) => {
    setReplyToMessage({
      id: message.id,
      content: message.content || '',
      username: message.username || 'Unknown User'
    });
  };

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Select a conversation</h2>
          <p className="text-gray-600">Choose a conversation from the sidebar to start messaging.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          {isMobile && onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentChat.avatar_url} />
            <AvatarFallback>
              {currentChat.name?.charAt(0).toUpperCase() || 'C'}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="font-semibold text-white">{currentChat.name}</h3>
            <div className="flex items-center space-x-2">
              {currentChat.isOnline && (
                <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                  Online
                </Badge>
              )}
              {currentChat.participants && (
                <span className="text-xs text-gray-400">
                  {currentChat.participants} participants
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Video className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Mute Conversation</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Leave Conversation</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <MessageList
          messages={messages}
          onDeleteMessage={deleteMessage}
          onReplyToMessage={handleReply}
        />
        
        <TypingIndicator typingUsers={typingUsers} />
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer */}
      <EnhancedMessageComposer
        onSendMessage={handleSendMessage}
        conversationId={currentChat.id}
        replyToMessage={replyToMessage}
        onCancelReply={() => setReplyToMessage(null)}
      />
    </div>
  );
};

export default Conversation;
