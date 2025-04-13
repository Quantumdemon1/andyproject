
import React from "react";
import { Check, CheckCheck } from "lucide-react";

interface MessageStatusProps {
  status: "sent" | "delivered" | "read";
}

const MessageStatus: React.FC<MessageStatusProps> = ({ status }) => {
  if (status === "read") {
    return <CheckCheck className="h-4 w-4 text-blue-400" />;
  } else if (status === "delivered") {
    return <CheckCheck className="h-4 w-4 text-gray-400" />;
  }
  return <Check className="h-4 w-4 text-gray-400" />;
};

export default MessageStatus;
