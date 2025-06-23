
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface AdminUserData {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string | null;
  is_banned: boolean | null;
  follower_count: number | null;
  post_count: number | null;
  email?: string;
  created_at?: string;
  last_seen?: string | null;
  is_online?: boolean | null;
}

export async function fetchAllUsers(): Promise<AdminUserData[]> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    toast({
      title: 'Error',
      description: 'Failed to load users',
      variant: 'destructive'
    });
    return [];
  }
}

export async function updateUserStatus(userId: string, updates: Partial<AdminUserData>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error updating user status:', error);
    toast({
      title: 'Error',
      description: 'Failed to update user status',
      variant: 'destructive'
    });
    return false;
  }
}

export async function banUser(userId: string): Promise<boolean> {
  return updateUserStatus(userId, { is_banned: true });
}

export async function unbanUser(userId: string): Promise<boolean> {
  return updateUserStatus(userId, { is_banned: false });
}

export async function promoteToCreator(userId: string): Promise<boolean> {
  return updateUserStatus(userId, { role: 'creator' });
}

export async function demoteFromCreator(userId: string): Promise<boolean> {
  return updateUserStatus(userId, { role: 'user' });
}

export async function getAdminStats() {
  try {
    const [usersResult, postsResult, notificationsResult] = await Promise.all([
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('notifications').select('*', { count: 'exact', head: true })
    ]);

    return {
      totalUsers: usersResult.count || 0,
      totalPosts: postsResult.count || 0,
      totalNotifications: notificationsResult.count || 0,
      bannedUsers: 0 // We'll calculate this separately if needed
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalUsers: 0,
      totalPosts: 0,
      totalNotifications: 0,
      bannedUsers: 0
    };
  }
}
