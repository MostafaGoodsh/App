-- Drop existing policies and recreate with proper settings
DROP POLICY IF EXISTS "Users can follow others" ON public.user_follows;
DROP POLICY IF EXISTS "Users can unfollow" ON public.user_follows;
DROP POLICY IF EXISTS "Users can view all follows" ON public.user_follows;

-- Create proper policies for user_follows
CREATE POLICY "Anyone can view follows" 
ON public.user_follows 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert follows" 
ON public.user_follows 
FOR INSERT 
WITH CHECK (auth.uid() = follower_id AND auth.uid() != following_id);

CREATE POLICY "Users can delete their own follows" 
ON public.user_follows 
FOR DELETE 
USING (auth.uid() = follower_id);

-- Create live_stream_gifts table for gift functionality
CREATE TABLE IF NOT EXISTS public.live_stream_gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL REFERENCES public.active_live_streams(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  gift_type TEXT NOT NULL DEFAULT 'heart',
  gift_value INTEGER NOT NULL DEFAULT 1,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on gifts
ALTER TABLE public.live_stream_gifts ENABLE ROW LEVEL SECURITY;

-- Policies for gifts
CREATE POLICY "Anyone can view gifts" 
ON public.live_stream_gifts 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can send gifts" 
ON public.live_stream_gifts 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- Enable realtime for faster updates on comments and likes
ALTER PUBLICATION supabase_realtime ADD TABLE live_stream_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE live_stream_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE live_stream_gifts;