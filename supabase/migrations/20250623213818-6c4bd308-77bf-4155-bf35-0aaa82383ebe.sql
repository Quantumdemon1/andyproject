
-- Create storage buckets for different types of content
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'user-content', 
  'user-content', 
  true,
  104857600, -- 100MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'application/pdf', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'application/pdf', 'text/plain'];

-- Create storage policies for user-content bucket
CREATE POLICY "Allow authenticated users to upload content"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-content' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow users to update their own content"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'user-content' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow public read access to user content"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'user-content');

CREATE POLICY "Allow users to delete their own content"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-content' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add content categories and tags table
CREATE TABLE IF NOT EXISTS public.content_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add post tags table for better content organization
CREATE TABLE IF NOT EXISTS public.post_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, tag)
);

-- Add scheduled posts table
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed', 'cancelled')),
  tags TEXT[],
  category_id UUID REFERENCES public.content_categories(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on new tables
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for content_categories (public read, authenticated write)
CREATE POLICY "Anyone can view categories" ON public.content_categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create categories" ON public.content_categories
  FOR INSERT TO authenticated WITH CHECK (true);

-- RLS policies for post_tags (follow post permissions)
CREATE POLICY "Anyone can view post tags" ON public.post_tags
  FOR SELECT USING (true);

CREATE POLICY "Users can create tags for their posts" ON public.post_tags
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = post_tags.post_id 
      AND posts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tags from their posts" ON public.post_tags
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = post_tags.post_id 
      AND posts.user_id = auth.uid()
    )
  );

-- RLS policies for scheduled_posts
CREATE POLICY "Users can view their own scheduled posts" ON public.scheduled_posts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled posts" ON public.scheduled_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled posts" ON public.scheduled_posts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled posts" ON public.scheduled_posts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Insert default categories
INSERT INTO public.content_categories (name, description, color) VALUES
  ('General', 'General content and discussions', '#6B7280'),
  ('Art', 'Artwork, digital art, and creative content', '#EC4899'),
  ('Photography', 'Photography and visual content', '#8B5CF6'),
  ('Music', 'Music, audio content, and sound', '#F59E0B'),
  ('Gaming', 'Gaming content and streams', '#10B981'),
  ('Education', 'Educational and tutorial content', '#3B82F6'),
  ('Entertainment', 'Entertainment and comedy', '#EF4444'),
  ('Lifestyle', 'Lifestyle, fashion, and personal content', '#F97316')
ON CONFLICT (name) DO NOTHING;
