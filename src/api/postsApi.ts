
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  author?: {
    username: string;
    avatar_url: string;
    display_name?: string;
  };
}

export async function fetchPosts(): Promise<Post[]> {
  try {
    // First get posts
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsError) throw postsError;

    if (!postsData || postsData.length === 0) {
      return [];
    }

    // Get unique user IDs
    const userIds = [...new Set(postsData.map(post => post.user_id))];

    // Get user profiles for these user IDs
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, username, avatar_url, display_name')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
    }

    // Create a map of user profiles by ID
    const profilesMap = new Map();
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
    }

    // Get likes and comments counts for all posts
    const postIds = postsData.map(post => post.id);
    
    const [likesData, commentsData] = await Promise.all([
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
    
    if (likesData.data) {
      likesData.data.forEach(like => {
        likesCount.set(like.post_id, (likesCount.get(like.post_id) || 0) + 1);
      });
    }
    
    if (commentsData.data) {
      commentsData.data.forEach(comment => {
        commentsCount.set(comment.post_id, (commentsCount.get(comment.post_id) || 0) + 1);
      });
    }

    // Combine posts with author information and counts
    const posts: Post[] = postsData.map((post: any) => {
      const profile = profilesMap.get(post.user_id);
      return {
        ...post,
        likes_count: likesCount.get(post.id) || 0,
        comments_count: commentsCount.get(post.id) || 0,
        author: profile ? {
          username: profile.username,
          avatar_url: profile.avatar_url,
          display_name: profile.display_name
        } : undefined
      };
    });

    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    toast({
      title: 'Error',
      description: 'Failed to load posts',
      variant: 'destructive'
    });
    return [];
  }
}

export async function createPost(content: string, imageUrl?: string, videoUrl?: string): Promise<Post | null> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: postData, error } = await supabase
      .from('posts')
      .insert({
        content,
        image_url: imageUrl,
        video_url: videoUrl,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;

    // Get user profile for the created post
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('username, avatar_url, display_name')
      .eq('id', user.id)
      .single();

    const post: Post = {
      ...postData,
      author: profileData ? {
        username: profileData.username,
        avatar_url: profileData.avatar_url,
        display_name: profileData.display_name
      } : undefined
    };

    toast({
      title: 'Success',
      description: 'Post created successfully',
    });

    return post;
  } catch (error) {
    console.error('Error creating post:', error);
    toast({
      title: 'Error',
      description: 'Failed to create post',
      variant: 'destructive'
    });
    return null;
  }
}

export async function getUserPostCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching user post count:', error);
    return 0;
  }
}
