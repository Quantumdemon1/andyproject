
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  tags: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  is_online: boolean | null;
  last_seen: string | null;
}

export interface CreatorProfile extends UserProfile {
  follower_count?: number;
  following_count?: number;
  post_count?: number;
}

export async function fetchCreators(): Promise<CreatorProfile[]> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .not('username', 'is', null)
      .limit(20);

    if (error) throw error;

    // Get follower counts for each creator
    const creatorsWithCounts = await Promise.all(
      data.map(async (creator) => {
        const [followerCount, followingCount, postCount] = await Promise.all([
          getFollowerCount(creator.id),
          getFollowingCount(creator.id),
          getPostCount(creator.id)
        ]);

        return {
          ...creator,
          follower_count: followerCount,
          following_count: followingCount,
          post_count: postCount
        };
      })
    );

    return creatorsWithCounts;
  } catch (error) {
    console.error('Error fetching creators:', error);
    toast({
      title: 'Error',
      description: 'Failed to load creators',
      variant: 'destructive'
    });
    return [];
  }
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string, 
  updates: Partial<Omit<UserProfile, 'id'>>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;

    toast({
      title: 'Success',
      description: 'Profile updated successfully',
    });

    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    toast({
      title: 'Error',
      description: 'Failed to update profile',
      variant: 'destructive'
    });
    return false;
  }
}

export async function getFollowerCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching follower count:', error);
    return 0;
  }
}

export async function getFollowingCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching following count:', error);
    return 0;
  }
}

export async function getPostCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching post count:', error);
    return 0;
  }
}

export async function followUser(followingId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('followers')
      .insert({
        following_id: followingId
      });

    if (error) throw error;

    toast({
      title: 'Success',
      description: 'User followed successfully',
    });

    return true;
  } catch (error) {
    console.error('Error following user:', error);
    toast({
      title: 'Error',
      description: 'Failed to follow user',
      variant: 'destructive'
    });
    return false;
  }
}

export async function unfollowUser(followingId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('following_id', followingId);

    if (error) throw error;

    toast({
      title: 'Success',
      description: 'User unfollowed successfully',
    });

    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    toast({
      title: 'Error',
      description: 'Failed to unfollow user',
      variant: 'destructive'
    });
    return false;
  }
}
