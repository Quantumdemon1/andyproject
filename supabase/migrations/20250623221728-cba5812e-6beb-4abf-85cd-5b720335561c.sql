
-- Create the missing database functions for search functionality

-- Global search function with full-text search capabilities
CREATE OR REPLACE FUNCTION public.global_search(
  search_query text, 
  search_type text DEFAULT 'all'::text, 
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

-- Track search function for analytics
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

-- Get trending searches function
CREATE OR REPLACE FUNCTION public.get_trending_searches(limit_count integer DEFAULT 10)
RETURNS TABLE(search_term text, search_count integer)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT search_term, search_count
  FROM public.search_analytics
  WHERE last_searched_at > now() - interval '7 days'
  ORDER BY search_count DESC, last_searched_at DESC
  LIMIT limit_count;
$$;

-- Add missing columns to messages table for threading and reactions support
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS reply_to_message_id uuid REFERENCES public.messages(id),
ADD COLUMN IF NOT EXISTS thread_id uuid;

-- Create message reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  emoji text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS on message_reactions
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for message_reactions
CREATE POLICY "Users can view all message reactions" 
  ON public.message_reactions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can add their own reactions" 
  ON public.message_reactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions" 
  ON public.message_reactions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable realtime on search_analytics table
ALTER TABLE public.search_analytics REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.search_analytics;

-- Enable realtime on message_reactions table
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON public.messages(reply_to_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_term ON public.search_analytics(search_term);
CREATE INDEX IF NOT EXISTS idx_search_analytics_last_searched ON public.search_analytics(last_searched_at DESC);
