-- Create live_stream_approvals table for managing live streaming access
CREATE TABLE public.live_stream_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  social_media_links JSONB DEFAULT '[]'::jsonb,
  follower_count INTEGER DEFAULT 0,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_stream_approvals ENABLE ROW LEVEL SECURITY;

-- Users can submit their own applications
CREATE POLICY "Users can insert their own applications"
ON public.live_stream_approvals
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own applications
CREATE POLICY "Users can view their own applications"
ON public.live_stream_approvals
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.live_stream_approvals
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Admins can update all applications
CREATE POLICY "Admins can update all applications"
ON public.live_stream_approvals
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_live_stream_approvals_updated_at
BEFORE UPDATE ON public.live_stream_approvals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();