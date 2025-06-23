
-- Create storage bucket for post media if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'post-media', 
  'post-media', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'profile_images', 
  'profile_images', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'message-attachments', 
  'message-attachments', 
  true,
  26214400, -- 25MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf', 'text/plain'];

-- Update storage policies for post-media bucket
DROP POLICY IF EXISTS "Allow users to upload their own media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read all media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to media" ON storage.objects;

-- Create comprehensive storage policies for post-media
CREATE POLICY "Allow authenticated users to upload post media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'post-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow users to update their own post media"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'post-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow public read access to post media"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'post-media');

CREATE POLICY "Allow users to delete their own post media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'post-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage policies for profile images
CREATE POLICY "Allow authenticated users to upload profile images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile_images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow users to update their own profile images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile_images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow public read access to profile images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'profile_images');

CREATE POLICY "Allow users to delete their own profile images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile_images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage policies for message attachments
CREATE POLICY "Allow authenticated users to upload message attachments"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'message-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow users to update their own message attachments"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'message-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow authenticated users to read message attachments"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'message-attachments');

CREATE POLICY "Allow users to delete their own message attachments"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'message-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add RLS policies for tables that are missing them (using DROP IF EXISTS to avoid conflicts)
DO $$ 
BEGIN
  -- Enable RLS on tables if not already enabled
  ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist and recreate them
  DROP POLICY IF EXISTS "Users can view all likes" ON public.likes;
  DROP POLICY IF EXISTS "Users can create likes" ON public.likes;
  DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;

  DROP POLICY IF EXISTS "Users can view all comments" ON public.comments;
  DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
  DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
  DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

  DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
  DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

  DROP POLICY IF EXISTS "Users can view all posts" ON public.posts;
  DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
  DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
  DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

  DROP POLICY IF EXISTS "Users can view all user profiles" ON public.user_profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

  -- Create new policies
  CREATE POLICY "Users can view all likes" ON public.likes
    FOR SELECT USING (true);

  CREATE POLICY "Users can create likes" ON public.likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete their own likes" ON public.likes
    FOR DELETE USING (auth.uid() = user_id);

  CREATE POLICY "Users can view all comments" ON public.comments
    FOR SELECT USING (true);

  CREATE POLICY "Users can create comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete their own comments" ON public.comments
    FOR DELETE USING (auth.uid() = user_id);

  CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

  CREATE POLICY "Users can view all posts" ON public.posts
    FOR SELECT USING (true);

  CREATE POLICY "Users can create their own posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete their own posts" ON public.posts
    FOR DELETE USING (auth.uid() = user_id);

  CREATE POLICY "Users can view all user profiles" ON public.user_profiles
    FOR SELECT USING (true);

  CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error occurred: %', SQLERRM;
END $$;
