
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus } from 'lucide-react';
import { followUser, unfollowUser, checkIfFollowing } from '@/api/followsApi';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface FollowButtonProps {
  userId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

const FollowButton: React.FC<FollowButtonProps> = ({ userId, className, size = 'sm' }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user && user.id !== userId) {
      checkIfFollowing(userId).then(setIsFollowing);
    }
  }, [user, userId]);

  const handleFollowToggle = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let success;
      if (isFollowing) {
        success = await unfollowUser(userId);
      } else {
        success = await followUser(userId);
      }
      
      if (success) {
        setIsFollowing(!isFollowing);
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.id === userId) {
    return null;
  }

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={isLoading}
      size={size}
      variant={isFollowing ? "outline" : "default"}
      className={className}
    >
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-1" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-1" />
          Follow
        </>
      )}
    </Button>
  );
};

export default FollowButton;
