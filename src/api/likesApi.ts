
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export async function toggleLike(postId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user already liked this post
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (error) throw error;
      return false; // unliked
    } else {
      // Like
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: user.id });
      
      if (error) throw error;
      return true; // liked
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    toast({
      title: 'Error',
      description: 'Failed to update like',
      variant: 'destructive'
    });
    throw error;
  }
}

export async function getLikesCount(postId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching likes count:', error);
    return 0;
  }
}
