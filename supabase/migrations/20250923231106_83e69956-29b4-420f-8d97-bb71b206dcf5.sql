-- Create reels likes table
CREATE TABLE public.reels_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reel_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (reel_id) REFERENCES reels_content(id) ON DELETE CASCADE,
  UNIQUE(reel_id, user_id)
);

-- Create reels comments table
CREATE TABLE public.reels_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reel_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (reel_id) REFERENCES reels_content(id) ON DELETE CASCADE
);

-- Enable RLS on both tables
ALTER TABLE public.reels_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for reels_likes
CREATE POLICY "Anyone can view likes on reels" 
ON public.reels_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can like reels" 
ON public.reels_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes" 
ON public.reels_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for reels_comments  
CREATE POLICY "Anyone can view comments on reels" 
ON public.reels_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can comment on reels" 
ON public.reels_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.reels_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.reels_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_reels_comments_updated_at
  BEFORE UPDATE ON public.reels_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();