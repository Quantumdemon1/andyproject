
-- Step 1: Add missing columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT;

-- Step 2: Create posts table for PostComposer functionality
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0
);

-- Step 3: Create followers table for social features
CREATE TABLE IF NOT EXISTS public.followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Step 4: Enable Row Level Security on all tables (safe to repeat)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.art_purchases ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

CREATE POLICY "Users can view all profiles" ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 6: Create RLS policies for posts
DROP POLICY IF EXISTS "Users can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

CREATE POLICY "Users can view all posts" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create own posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- Step 7: Create RLS policies for followers
DROP POLICY IF EXISTS "Users can view all follow relationships" ON public.followers;
DROP POLICY IF EXISTS "Users can create own follow relationships" ON public.followers;
DROP POLICY IF EXISTS "Users can delete own follow relationships" ON public.followers;

CREATE POLICY "Users can view all follow relationships" ON public.followers
  FOR SELECT USING (true);

CREATE POLICY "Users can create own follow relationships" ON public.followers
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follow relationships" ON public.followers
  FOR DELETE USING (auth.uid() = follower_id);

-- Step 8: Create RLS policies for conversations
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;

CREATE POLICY "Users can view conversations they participate in" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants 
      WHERE conversation_id = conversations.id AND user_id = auth.uid()
    )
  );

-- Step 9: Create RLS policies for conversation_participants
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;

CREATE POLICY "Users can view participants of their conversations" ON public.conversation_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp2 
      WHERE cp2.conversation_id = conversation_participants.conversation_id AND cp2.user_id = auth.uid()
    )
  );

-- Step 10: Create RLS policies for messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;

CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants 
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversation_participants 
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

-- Step 11: Create RLS policies for subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can create subscriptions as subscriber" ON public.subscriptions;

CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = subscriber_id OR auth.uid() = creator_id);

CREATE POLICY "Users can create subscriptions as subscriber" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = subscriber_id);

-- Step 12: Create RLS policies for art_purchases
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.art_purchases;
DROP POLICY IF EXISTS "Users can create purchases as buyer" ON public.art_purchases;

CREATE POLICY "Users can view their own purchases" ON public.art_purchases
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create purchases as buyer" ON public.art_purchases
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Step 13: Create optimized function for conversation data (fixes N+1 query issue)
CREATE OR REPLACE FUNCTION public.get_user_conversations(user_uuid UUID)
RETURNS TABLE (
  conversation_id UUID,
  conversation_name TEXT,
  is_group BOOLEAN,
  conversation_created_at TIMESTAMP WITH TIME ZONE,
  conversation_updated_at TIMESTAMP WITH TIME ZONE,
  last_message_content TEXT,
  last_message_created_at TIMESTAMP WITH TIME ZONE,
  last_message_status TEXT,
  participant_count BIGINT,
  other_participant_username TEXT,
  other_participant_avatar_url TEXT,
  other_participant_is_online BOOLEAN
) LANGUAGE SQL SECURITY DEFINER AS $$
  WITH user_conversations AS (
    SELECT c.id, c.name, c.is_group, c.created_at, c.updated_at
    FROM conversations c
    JOIN conversation_participants cp ON c.id = cp.conversation_id
    WHERE cp.user_id = user_uuid
  ),
  last_messages AS (
    SELECT DISTINCT ON (m.conversation_id)
      m.conversation_id,
      m.content,
      m.created_at,
      m.status
    FROM messages m
    WHERE m.conversation_id IN (SELECT id FROM user_conversations)
    ORDER BY m.conversation_id, m.created_at DESC
  ),
  conversation_participants_info AS (
    SELECT 
      cp.conversation_id,
      COUNT(*) as participant_count,
      STRING_AGG(
        CASE WHEN cp.user_id != user_uuid THEN up.username END, 
        ', '
      ) as other_usernames,
      STRING_AGG(
        CASE WHEN cp.user_id != user_uuid THEN up.avatar_url END, 
        ', '
      ) as other_avatars,
      BOOL_OR(
        CASE WHEN cp.user_id != user_uuid THEN up.is_online ELSE false END
      ) as other_is_online
    FROM conversation_participants cp
    LEFT JOIN user_profiles up ON cp.user_id = up.id
    WHERE cp.conversation_id IN (SELECT id FROM user_conversations)
    GROUP BY cp.conversation_id
  )
  SELECT 
    uc.id as conversation_id,
    uc.name as conversation_name,
    uc.is_group,
    uc.created_at as conversation_created_at,
    uc.updated_at as conversation_updated_at,
    lm.content as last_message_content,
    lm.created_at as last_message_created_at,
    lm.status as last_message_status,
    cpi.participant_count,
    SPLIT_PART(cpi.other_usernames, ', ', 1) as other_participant_username,
    SPLIT_PART(cpi.other_avatars, ', ', 1) as other_participant_avatar_url,
    cpi.other_is_online as other_participant_is_online
  FROM user_conversations uc
  LEFT JOIN last_messages lm ON uc.id = lm.conversation_id
  LEFT JOIN conversation_participants_info cpi ON uc.id = cpi.conversation_id
  ORDER BY COALESCE(lm.created_at, uc.updated_at) DESC;
$$;
