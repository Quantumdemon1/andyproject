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

export interface PostsResponse {
  posts: Post[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

const POSTS_PER_PAGE = 10;

export async function fetchPosts(
  page: number = 1, 
  limit: number = POSTS_PER_PAGE,
  filter: string = 'all'
): Promise<PostsResponse> {
  try {
    const offset = (page - 1) * limit;
    const { data: { user } } = await supabase.auth.getUser();

    // Build the query based on filter
    let query = supabase.from('posts').select('*');
    
    // Apply filters
    switch (filter) {
      case 'following':
        if (user) {
          // Get posts from users that the current user follows
          const { data: followingData } = await supabase
            .from('followers')
            .select('following_id')
            .eq('follower_id', user.id);
          
          const followingIds = followingData?.map(f => f.following_id) || [];
          if (followingIds.length > 0) {
            query = query.in('user_id', followingIds);
          } else {
            // If not following anyone, return empty result
            return {
              posts: [],
              totalCount: 0,
              totalPages: 0,
              currentPage: page,
              hasMore: false,
            };
          }
        }
        break;
      case 'media':
        // Only posts with images or videos - use correct syntax
        query = query.or('image_url.not.is.null,video_url.not.is.null');
        break;
      case 'recent':
        // Posts from the last 24 hours
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        query = query.gte('created_at', yesterday.toISOString());
        break;
      case 'all':
      default:
        // No additional filter for 'all'
        break;
    }

    // Get total count first for pagination
    const { count: totalCount, error: countError } = await query
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get posts with pagination
    const { data: postsData, error: postsError } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) throw postsError;

    if (!postsData || postsData.length === 0) {
      return {
        posts: [],
        totalCount: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
        currentPage: page,
        hasMore: false,
      };
    }

    // Get unique user IDs for batch profile fetch
    const userIds = [...new Set(postsData.map(post => post.user_id))];

    // Batch fetch user profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, username, avatar_url, display_name')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
    }

    // Create profiles map for O(1) lookup
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

    const totalPages = Math.ceil((totalCount || 0) / limit);
    const hasMore = page < totalPages;

    return {
      posts,
      totalCount: totalCount || 0,
      totalPages,
      currentPage: page,
      hasMore,
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    toast({
      title: 'Error',
      description: 'Failed to load posts',
      variant: 'destructive'
    });
    return {
      posts: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
      hasMore: false,
    };
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
