
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

// Type guard to validate API response
function isValidPost(post: any): post is Post {
  return post && 
    typeof post.id === 'string' &&
    typeof post.user_id === 'string' &&
    typeof post.content === 'string' &&
    typeof post.created_at === 'string' &&
    typeof post.updated_at === 'string';
}

export async function fetchPosts(
  page: number = 1, 
  limit: number = POSTS_PER_PAGE,
  filter: string = 'all'
): Promise<PostsResponse> {
  const startTime = performance.now();
  
  try {
    console.log(`Fetching posts: page ${page}, filter: ${filter}`);
    const offset = (page - 1) * limit;
    const { data: { user } } = await supabase.auth.getUser();

    // Build the query based on filter
    let query = supabase.from('posts').select('*');
    
    // Apply filters
    switch (filter) {
      case 'following':
        if (user) {
          console.log('Applying following filter for user:', user.id);
          // Get posts from users that the current user follows
          const { data: followingData, error: followingError } = await supabase
            .from('followers')
            .select('following_id')
            .eq('follower_id', user.id);
          
          if (followingError) {
            console.error('Error fetching following data:', followingError);
            throw followingError;
          }
          
          const followingIds = followingData?.map(f => f.following_id) || [];
          console.log('Following IDs:', followingIds);
          
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
        } else {
          console.log('No authenticated user for following filter');
          return {
            posts: [],
            totalCount: 0,
            totalPages: 0,
            currentPage: page,
            hasMore: false,
          };
        }
        break;
      case 'media':
        console.log('Applying media filter');
        // Only posts with images or videos
        query = query.or('image_url.not.is.null,video_url.not.is.null');
        break;
      case 'recent':
        console.log('Applying recent filter');
        // Posts from the last 24 hours
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        query = query.gte('created_at', yesterday.toISOString());
        break;
      case 'all':
      default:
        console.log('Applying all posts filter (no additional filter)');
        // No additional filter for 'all'
        break;
    }

    // Add where clause to filter out deleted posts
    query = query.eq('is_deleted', false);

    // Get total count first for pagination
    let countQuery = supabase.from('posts').select('id', { count: 'exact' }).eq('is_deleted', false);
    
    // Apply the same filters to count query
    switch (filter) {
      case 'following':
        if (user) {
          const { data: followingData } = await supabase
            .from('followers')
            .select('following_id')
            .eq('follower_id', user.id);
          
          const followingIds = followingData?.map(f => f.following_id) || [];
          
          if (followingIds.length > 0) {
            countQuery = countQuery.in('user_id', followingIds);
          } else {
            return {
              posts: [],
              totalCount: 0,
              totalPages: 0,
              currentPage: page,
              hasMore: false,
            };
          }
        } else {
          return {
            posts: [],
            totalCount: 0,
            totalPages: 0,
            currentPage: page,
            hasMore: false,
          };
        }
        break;
      case 'media':
        countQuery = countQuery.or('image_url.not.is.null,video_url.not.is.null');
        break;
      case 'recent':
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        countQuery = countQuery.gte('created_at', yesterday.toISOString());
        break;
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('Error getting post count:', countError);
      throw countError;
    }

    console.log(`Total posts found: ${totalCount}`);

    // Get posts with pagination
    const { data: postsData, error: postsError } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      throw postsError;
    }

    if (!postsData || postsData.length === 0) {
      console.log('No posts found');
      return {
        posts: [],
        totalCount: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
        currentPage: page,
        hasMore: false,
      };
    }

    console.log(`Found ${postsData.length} posts`);

    // Validate posts data
    const validPosts = postsData.filter(isValidPost);
    if (validPosts.length !== postsData.length) {
      console.warn(`Filtered out ${postsData.length - validPosts.length} invalid posts`);
    }

    // Get unique user IDs for batch profile fetch
    const userIds = [...new Set(validPosts.map(post => post.user_id))];
    console.log(`Fetching profiles for ${userIds.length} users`);

    // Batch fetch user profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, username, avatar_url, display_name')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
      // Don't throw here, continue without profile data
    }

    // Create profiles map for O(1) lookup
    const profilesMap = new Map();
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
      console.log(`Loaded ${profilesData.length} user profiles`);
    }

    // Get post IDs for batch likes/comments count
    const postIds = validPosts.map(post => post.id);
    
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
        .eq('is_deleted', false)
    ]);

    if (likesResponse.error) {
      console.error('Error fetching likes:', likesResponse.error);
    }
    if (commentsResponse.error) {
      console.error('Error fetching comments:', commentsResponse.error);
    }

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
    const posts: Post[] = validPosts.map((post: any) => {
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

    const endTime = performance.now();
    console.log(`Posts fetched in ${endTime - startTime}ms - ${posts.length} posts, page ${page}/${totalPages}`);

    return {
      posts,
      totalCount: totalCount || 0,
      totalPages,
      currentPage: page,
      hasMore,
    };
  } catch (error) {
    const endTime = performance.now();
    console.error(`Posts fetch failed in ${endTime - startTime}ms:`, error);
    
    // More specific error messages
    let errorMessage = 'Failed to load posts';
    if (error instanceof Error) {
      if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Permission denied. Please try logging in again.';
      }
    }
    
    toast({
      title: 'Error',
      description: errorMessage,
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
        user_id: user.id,
        is_deleted: false
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
      likes_count: 0,
      comments_count: 0,
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
      .eq('user_id', userId)
      .eq('is_deleted', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching user post count:', error);
    return 0;
  }
}
