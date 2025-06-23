
-- Create a search index for posts to improve search performance
CREATE INDEX IF NOT EXISTS idx_posts_content_search ON posts USING gin(to_tsvector('english', content));

-- Create a search index for user profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_search ON user_profiles USING gin(
  to_tsvector('english', coalesce(username, '') || ' ' || coalesce(display_name, '') || ' ' || coalesce(bio, ''))
);

-- Create a function for global search across posts and users
CREATE OR REPLACE FUNCTION public.global_search(
  search_query text,
  search_type text DEFAULT 'all', -- 'all', 'posts', 'users'
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0
)
RETURNS TABLE(
  result_type text,
  result_id uuid,
  title text,
  content text,
  avatar_url text,
  username text,
  created_at timestamp with time zone,
  rank real
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  (
    -- Search in posts
    SELECT 
      'post'::text as result_type,
      p.id as result_id,
      left(p.content, 100) as title,
      p.content,
      up.avatar_url,
      up.username,
      p.created_at,
      ts_rank(to_tsvector('english', p.content), plainto_tsquery('english', search_query)) as rank
    FROM posts p
    JOIN user_profiles up ON p.user_id = up.id
    WHERE (search_type = 'all' OR search_type = 'posts')
      AND p.is_deleted = false
      AND to_tsvector('english', p.content) @@ plainto_tsquery('english', search_query)
  )
  UNION ALL
  (
    -- Search in user profiles
    SELECT 
      'user'::text as result_type,
      up.id as result_id,
      coalesce(up.display_name, up.username) as title,
      up.bio as content,
      up.avatar_url,
      up.username,
      null::timestamp with time zone as created_at,
      ts_rank(
        to_tsvector('english', coalesce(up.username, '') || ' ' || coalesce(up.display_name, '') || ' ' || coalesce(up.bio, '')), 
        plainto_tsquery('english', search_query)
      ) as rank
    FROM user_profiles up
    WHERE (search_type = 'all' OR search_type = 'users')
      AND up.is_banned = false
      AND to_tsvector('english', coalesce(up.username, '') || ' ' || coalesce(up.display_name, '') || ' ' || coalesce(up.bio, '')) @@ plainto_tsquery('english', search_query)
  )
  ORDER BY rank DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Create a function for trending searches (track popular search terms)
CREATE TABLE IF NOT EXISTS public.search_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_term text NOT NULL,
  search_count integer DEFAULT 1,
  last_searched_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Create index for search analytics
CREATE INDEX IF NOT EXISTS idx_search_analytics_term ON search_analytics(search_term);
CREATE INDEX IF NOT EXISTS idx_search_analytics_count ON search_analytics(search_count DESC);

-- Function to track and update search analytics
CREATE OR REPLACE FUNCTION public.track_search(search_term text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.search_analytics (search_term, search_count, last_searched_at)
  VALUES (lower(trim(search_term)), 1, now())
  ON CONFLICT (search_term) 
  DO UPDATE SET 
    search_count = search_analytics.search_count + 1,
    last_searched_at = now();
END;
$$;

-- Function to get trending searches
CREATE OR REPLACE FUNCTION public.get_trending_searches(limit_count integer DEFAULT 10)
RETURNS TABLE(
  search_term text,
  search_count integer
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT search_term, search_count
  FROM public.search_analytics
  WHERE last_searched_at > now() - interval '7 days'
  ORDER BY search_count DESC, last_searched_at DESC
  LIMIT limit_count;
$$;
