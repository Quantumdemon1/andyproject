
-- Create subscription tiers table
CREATE TABLE public.subscription_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  benefits TEXT[], -- Array of benefit descriptions
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(creator_id, name)
);

-- Add indexes for performance
CREATE INDEX idx_subscription_tiers_creator_id ON public.subscription_tiers(creator_id);
CREATE INDEX idx_subscription_tiers_active ON public.subscription_tiers(creator_id, is_active);

-- Enable Row Level Security
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view active subscription tiers" 
  ON public.subscription_tiers 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Creators can manage their own tiers" 
  ON public.subscription_tiers 
  FOR ALL 
  USING (creator_id = auth.uid());

-- Add tier_id to subscriptions table to link to specific tiers
ALTER TABLE public.subscriptions 
ADD COLUMN tier_id UUID REFERENCES public.subscription_tiers(id);

-- Create index for the new foreign key
CREATE INDEX idx_subscriptions_tier_id ON public.subscriptions(tier_id);

-- Insert some default tiers for existing creators (optional)
INSERT INTO public.subscription_tiers (creator_id, name, description, price, benefits, display_order)
SELECT 
  DISTINCT creator_id,
  'Basic',
  'Access to exclusive content',
  9.99,
  ARRAY['Exclusive content', 'Direct messaging', 'Early access'],
  1
FROM public.subscriptions 
WHERE creator_id IS NOT NULL
ON CONFLICT (creator_id, name) DO NOTHING;
