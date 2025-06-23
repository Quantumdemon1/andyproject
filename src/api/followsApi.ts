
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface FollowRelationship {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export async function followUser(userId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to follow users',
        variant: 'destructive'
      });
      return false;
    }

    if (user.id === userId) {
      toast({
        title: 'Error',
        description: 'You cannot follow yourself',
        variant: 'destructive'
      });
      return false;
    }

    const { error } = await supabase
      .from('followers')
      .insert({
        follower_id: user.id,
        following_id: userId
      });

    if (error) throw error;

    // Update follower count using the database function
    const { error: updateError } = await (supabase as any).rpc('increment_follower_count', { 
      user_id: userId 
    });

    if (updateError) {
      console.error('Error updating follower count:', updateError);
    }

    toast({
      title: 'Success',
      description: 'User followed successfully'
    });
    return true;
  } catch (error: any) {
    if (error.code === '23505') {
      toast({
        title: 'Info',
        description: 'You are already following this user',
        variant: 'default'
      });
    } else {
      console.error('Error following user:', error);
      toast({
        title: 'Error',
        description: 'Failed to follow user',
        variant: 'destructive'
      });
    }
    return false;
  }
}

export async function unfollowUser(userId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to unfollow users',
        variant: 'destructive'
      });
      return false;
    }

    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', userId);

    if (error) throw error;

    // Update follower count using the database function
    const { error: updateError } = await (supabase as any).rpc('decrement_follower_count', { 
      user_id: userId 
    });

    if (updateError) {
      console.error('Error updating follower count:', updateError);
    }

    toast({
      title: 'Success',
      description: 'User unfollowed successfully'
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

export async function checkIfFollowing(userId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return !!data;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
}

export async function getFollowers(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('followers')
      .select(`
        follower_id,
        user_profiles!followers_follower_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('following_id', userId);

    if (error) throw error;

    return data?.map(item => item.user_profiles) || [];
  } catch (error) {
    console.error('Error fetching followers:', error);
    return [];
  }
}

export async function getFollowing(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('followers')
      .select(`
        following_id,
        user_profiles!followers_following_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('follower_id', userId);

    if (error) throw error;

    return data?.map(item => item.user_profiles) || [];
  } catch (error) {
    console.error('Error fetching following:', error);
    return [];
  }
}
