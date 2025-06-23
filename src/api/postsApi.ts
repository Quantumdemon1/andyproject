
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
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user_profiles:user_id (
          username,
          avatar_url,
          display_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const posts: Post[] = data.map((post: any) => ({
      ...post,
      author: post.user_profiles ? {
        username: post.user_profiles.username,
        avatar_url: post.user_profiles.avatar_url,
        display_name: post.user_profiles.display_name
      } : undefined
    }));

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
    const { data, error } = await supabase
      .from('posts')
      .insert({
        content,
        image_url: imageUrl,
        video_url: videoUrl
      })
      .select(`
        *,
        user_profiles:user_id (
          username,
          avatar_url,
          display_name
        )
      `)
      .single();

    if (error) throw error;

    const post: Post = {
      ...data,
      author: data.user_profiles ? {
        username: data.user_profiles.username,
        avatar_url: data.user_profiles.avatar_url,
        display_name: data.user_profiles.display_name
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
