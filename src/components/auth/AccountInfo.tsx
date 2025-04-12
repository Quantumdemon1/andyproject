
import React from "react";

const AccountInfo: React.FC = () => {
  return (
    <div className="pt-4 text-center text-sm text-gray-400">
      <p>For testing purposes, you can use these accounts:</p>
      <div className="mt-2 p-3 bg-aura-charcoal/50 rounded-md">
        <p className="mb-1"><span className="text-aura-blue">Admin:</span> admin@example.com / password123</p>
        <p><span className="text-aura-blue">User:</span> user@example.com / password123</p>
      </div>
    </div>
  );
};

export default AccountInfo;
