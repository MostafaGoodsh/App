-- Create live_streams table for storing all streams (active and past)
CREATE TABLE IF NOT EXISTS public.live_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  stream_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'deleted')),
  viewer_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "الجميع يمكنهم مشاهدة البثوث النشطة" 
ON public.live_streams 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "المستخدمون يمكنهم مشاهدة بثوثهم" 
ON public.live_streams 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "المستخدمون يمكنهم إنشاء بثوثهم" 
ON public.live_streams 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "المستخدمون يمكنهم تحديث بثوثهم" 
ON public.live_streams 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "المستخدمون يمكنهم حذف بثوثهم" 
ON public.live_streams 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "الإداريون يمكنهم مشاهدة كل البثوث" 
ON public.live_streams 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "الإداريون يمكنهم حذف أي بث" 
ON public.live_streams 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Create indexes
CREATE INDEX idx_live_streams_user_id ON public.live_streams(user_id);
CREATE INDEX idx_live_streams_status ON public.live_streams(status);
CREATE INDEX idx_live_streams_started_at ON public.live_streams(started_at DESC);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_live_streams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_live_streams_updated_at_trigger
BEFORE UPDATE ON public.live_streams
FOR EACH ROW
EXECUTE FUNCTION update_live_streams_updated_at();