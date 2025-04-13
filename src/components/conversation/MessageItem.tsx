
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Paperclip } from "lucide-react";
import { Message } from "@/hooks/useMessaging";
import MessageStatus from "./MessageStatus";
import MessageActions from "@/components/MessageActions";

interface MessageItemProps {
  message: Message;
  onDelete: (messageId: string) => Promise<void>;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onDelete }) => {
  return (
    <div className={`flex ${message.isMe ? "justify-end" : "justify-start"} group`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          message.isMe
            ? "bg-gradient-to-r from-aura-blue to-aura-purple text-white"
            : "bg-white/10 text-white"
        }`}
      >
        {message.attachment_url && (
          <div className="mb-2">
            <a 
              href={message.attachment_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              {message.attachment_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img 
                  src={message.attachment_url} 
                  alt="Attachment" 
                  className="max-h-60 rounded-md object-contain"
                />
              ) : (
                <div className="flex items-center space-x-2 bg-white/10 p-2 rounded-md">
                  <Paperclip className="h-4 w-4" />
                  <span className="text-sm truncate">Attachment</span>
                </div>
              )}
            </a>
          </div>
        )}
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div className="text-xs mt-1 flex items-center justify-between">
          <span className="text-gray-300">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
          <div className="flex items-center space-x-2">
            {message.isMe && (
              <span>
                <MessageStatus status={message.status} />
              </span>
            )}
            <MessageActions
              message={message}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
