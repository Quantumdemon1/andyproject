
import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Copy, Edit, Trash2, MoreVertical } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Message } from '@/hooks/useMessaging';

interface MessageActionsProps {
  message: Message;
  onDelete: (messageId: string) => Promise<void>;
  onEdit?: (messageId: string, content: string) => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({ message, onDelete, onEdit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast({
      title: 'Copied',
      description: 'Message copied to clipboard',
    });
    setIsOpen(false);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(message.id);
      toast({
        title: 'Message deleted',
        description: 'Your message has been deleted',
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(message.id, message.content);
      setIsOpen(false);
    }
  };

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <button className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
          <MoreVertical className="h-4 w-4 text-gray-400" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[200px] bg-white/10 backdrop-blur-xl rounded-md border border-white/20 shadow-md p-1"
          sideOffset={5}
          align="end"
        >
          <DropdownMenu.Item
            className="flex items-center p-2 text-sm text-white hover:bg-white/10 rounded cursor-pointer"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Text
          </DropdownMenu.Item>
          
          {message.isMe && onEdit && (
            <DropdownMenu.Item
              className="flex items-center p-2 text-sm text-white hover:bg-white/10 rounded cursor-pointer"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Message
            </DropdownMenu.Item>
          )}
          
          {message.isMe && (
            <DropdownMenu.Item
              className="flex items-center p-2 text-sm text-red-400 hover:bg-white/10 rounded cursor-pointer"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete Message'}
            </DropdownMenu.Item>
          )}
          
          <DropdownMenu.Arrow className="fill-white/10" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default MessageActions;
