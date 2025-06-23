
-- Create reports table for user reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  reported_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('spam', 'harassment', 'inappropriate_content', 'copyright', 'fake_account', 'other')),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create moderation_actions table to track admin actions
CREATE TABLE public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  target_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('warn', 'ban', 'unban', 'delete_post', 'delete_comment', 'restore_post', 'restore_comment')),
  reason TEXT NOT NULL,
  duration_hours INTEGER, -- For temporary bans
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_flags table for automated flagging
CREATE TABLE public.content_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('spam_detection', 'profanity', 'violence', 'adult_content', 'suspicious_activity')),
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  auto_action_taken TEXT CHECK (auto_action_taken IN ('none', 'hidden', 'removed')),
  reviewed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all moderation tables
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;

-- Create policies for reports table
CREATE POLICY "Users can create their own reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Create policies for admins to access all moderation data
CREATE POLICY "Admins can view all reports" ON public.reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update reports" ON public.reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all moderation actions" ON public.moderation_actions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all content flags" ON public.content_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_type ON public.reports(report_type);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX idx_moderation_actions_admin_id ON public.moderation_actions(admin_id);
CREATE INDEX idx_moderation_actions_created_at ON public.moderation_actions(created_at DESC);
CREATE INDEX idx_content_flags_reviewed ON public.content_flags(reviewed);
CREATE INDEX idx_content_flags_confidence ON public.content_flags(confidence_score DESC);

-- Add soft delete columns to posts and comments tables
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Create function to handle user banning (fixed parameter ordering)
CREATE OR REPLACE FUNCTION public.ban_user(
  _user_id UUID,
  _admin_id UUID,
  _reason TEXT,
  _duration_hours INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Update user profile to banned status
  UPDATE public.user_profiles 
  SET is_banned = true 
  WHERE id = _user_id;
  
  -- Record the moderation action
  INSERT INTO public.moderation_actions (
    admin_id, target_user_id, action_type, reason, duration_hours
  ) VALUES (
    _admin_id, _user_id, 'ban', _reason, _duration_hours
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle content deletion (fixed parameter ordering)
CREATE OR REPLACE FUNCTION public.delete_content(
  _admin_id UUID,
  _reason TEXT,
  _post_id UUID DEFAULT NULL,
  _comment_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF _post_id IS NOT NULL THEN
    UPDATE public.posts 
    SET is_deleted = true, deleted_at = now(), deleted_by = _admin_id
    WHERE id = _post_id;
    
    INSERT INTO public.moderation_actions (
      admin_id, target_post_id, action_type, reason
    ) VALUES (
      _admin_id, _post_id, 'delete_post', _reason
    );
  END IF;
  
  IF _comment_id IS NOT NULL THEN
    UPDATE public.comments 
    SET is_deleted = true, deleted_at = now(), deleted_by = _admin_id
    WHERE id = _comment_id;
    
    INSERT INTO public.moderation_actions (
      admin_id, target_comment_id, action_type, reason
    ) VALUES (
      _admin_id, _comment_id, 'delete_comment', _reason
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
