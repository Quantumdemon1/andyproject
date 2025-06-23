
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
  author?: {
    username: string;
    avatar_url: string;
    display_name?: string;
  };
}

export async function fetchComments(postId: string): Promise<Comment[]> {
  try {
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (commentsError) throw commentsError;

    if (!commentsData || commentsData.length === 0) {
      return [];
    }

    // Get unique user IDs
    const userIds = [...new Set(commentsData.map(comment => comment.user_id))];

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

    // Combine comments with author information
    const comments: Comment[] = commentsData.map((comment: any) => {
      const profile = profilesMap.get(comment.user_id);
      return {
        ...comment,
        author: profile ? {
          username: profile.username,
          avatar_url: profile.avatar_url,
          display_name: profile.display_name
        } : undefined
      };
    });

    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    toast({
      title: 'Error',
      description: 'Failed to load comments',
      variant: 'destructive'
    });
    return [];
  }
}

export async function createComment(postId: string, content: string): Promise<Comment | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: commentData, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim()
      })
      .select()
      .single();

    if (error) throw error;

    // Get user profile for the created comment
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('username, avatar_url, display_name')
      .eq('id', user.id)
      .single();

    const comment: Comment = {
      ...commentData,
      author: profileData ? {
        username: profileData.username,
        avatar_url: profileData.avatar_url,
        display_name: profileData.display_name
      } : undefined
    };

    toast({
      title: 'Success',
      description: 'Comment posted successfully',
    });

    return comment;
  } catch (error) {
    console.error('Error creating comment:', error);
    toast({
      title: 'Error',
      description: 'Failed to post comment',
      variant: 'destructive'
    });
    return null;
  }
}

export async function getCommentsCount(postId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching comments count:', error);
    return 0;
  }
}
