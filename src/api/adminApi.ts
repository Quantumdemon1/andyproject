
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface AdminPost {
  id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  author: {
    username: string;
    display_name?: string;
    avatar_url: string;
  };
}

export interface AdminUser {
  id: string;
  username: string;
  display_name?: string;
  avatar_url: string;
  role: string;
  is_banned: boolean;
  follower_count: number;
  post_count: number;
  last_seen?: string;
}

export async function fetchAllPosts(page: number = 1, limit: number = 20): Promise<{
  posts: AdminPost[];
  totalCount: number;
  totalPages: number;
}> {
  try {
    const offset = (page - 1) * limit;

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get posts first
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) throw postsError;

    if (!postsData || postsData.length === 0) {
      return { posts: [], totalCount: totalCount || 0, totalPages: 0 };
    }

    // Get unique user IDs
    const userIds = [...new Set(postsData.map(post => post.user_id))];

    // Get user profiles separately
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
    }

    // Create profiles map
    const profilesMap = new Map();
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
    }

    // Get post IDs for batch likes/comments count
    const postIds = postsData.map(post => post.id);
    
    // Batch fetch likes and comments counts
    const [likesResponse, commentsResponse] = await Promise.all([
      supabase
        .from('likes')
        .select('post_id')
        .in('post_id', postIds),
      supabase
        .from('comments')
        .select('post_id')
        .in('post_id', postIds)
    ]);

    // Count likes and comments per post
    const likesCount = new Map();
    const commentsCount = new Map();
    
    if (likesResponse.data) {
      likesResponse.data.forEach(like => {
        likesCount.set(like.post_id, (likesCount.get(like.post_id) || 0) + 1);
      });
    }
    
    if (commentsResponse.data) {
      commentsResponse.data.forEach(comment => {
        commentsCount.set(comment.post_id, (commentsCount.get(comment.post_id) || 0) + 1);
      });
    }

    const posts: AdminPost[] = postsData.map(post => {
      const profile = profilesMap.get(post.user_id);
      return {
        ...post,
        likes_count: likesCount.get(post.id) || 0,
        comments_count: commentsCount.get(post.id) || 0,
        author: {
          username: profile?.username || 'Unknown',
          display_name: profile?.display_name,
          avatar_url: profile?.avatar_url || '/placeholder.svg'
        }
      };
    });

    return {
      posts,
      totalCount: totalCount || 0,
      totalPages: Math.ceil((totalCount || 0) / limit)
    };
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch posts',
      variant: 'destructive'
    });
    return { posts: [], totalCount: 0, totalPages: 0 };
  }
}

export async function deletePost(postId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;

    toast({
      title: 'Success',
      description: 'Post deleted successfully'
    });
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete post',
      variant: 'destructive'
    });
    return false;
  }
}

export async function fetchAllUsers(page: number = 1, limit: number = 20): Promise<{
  users: AdminUser[];
  totalCount: number;
  totalPages: number;
}> {
  try {
    const offset = (page - 1) * limit;

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get users
    const { data: usersData, error: usersError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('last_seen', { ascending: false })
      .range(offset, offset + limit - 1);

    if (usersError) throw usersError;

    const users: AdminUser[] = usersData?.map(user => ({
      id: user.id,
      username: user.username || 'Unknown',
      display_name: user.display_name,
      avatar_url: user.avatar_url || '/placeholder.svg',
      role: user.role || 'user',
      is_banned: user.is_banned || false,
      follower_count: user.follower_count || 0,
      post_count: user.post_count || 0,
      last_seen: user.last_seen
    })) || [];

    return {
      users,
      totalCount: totalCount || 0,
      totalPages: Math.ceil((totalCount || 0) / limit)
    };
  } catch (error) {
    console.error('Error fetching admin users:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch users',
      variant: 'destructive'
    });
    return { users: [], totalCount: 0, totalPages: 0 };
  }
}

export async function banUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_banned: true })
      .eq('id', userId);

    if (error) throw error;

    toast({
      title: 'Success',
      description: 'User banned successfully'
    });
    return true;
  } catch (error) {
    console.error('Error banning user:', error);
    toast({
      title: 'Error',
      description: 'Failed to ban user',
      variant: 'destructive'
    });
    return false;
  }
}

export async function unbanUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_banned: false })
      .eq('id', userId);

    if (error) throw error;

    toast({
      title: 'Success',
      description: 'User unbanned successfully'
    });
    return true;
  } catch (error) {
    console.error('Error unbanning user:', error);
    toast({
      title: 'Error',
      description: 'Failed to unban user',
      variant: 'destructive'
    });
    return false;
  }
}

export async function getDashboardStats(): Promise<{
  totalUsers: number;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
}> {
  try {
    const [usersCount, postsCount, likesCount, commentsCount] = await Promise.all([
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('likes').select('*', { count: 'exact', head: true }),
      supabase.from('comments').select('*', { count: 'exact', head: true })
    ]);

    return {
      totalUsers: usersCount.count || 0,
      totalPosts: postsCount.count || 0,
      totalLikes: likesCount.count || 0,
      totalComments: commentsCount.count || 0
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalUsers: 0,
      totalPosts: 0,
      totalLikes: 0,
      totalComments: 0
    };
  }
}
