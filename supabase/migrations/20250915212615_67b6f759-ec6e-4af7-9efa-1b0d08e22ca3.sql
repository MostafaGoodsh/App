-- Create a dedicated bucket for reels content
INSERT INTO storage.buckets (id, name, public) 
VALUES ('reels-content', 'reels-content', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the reels-content bucket
CREATE POLICY "Reels content is publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'reels-content');

CREATE POLICY "Admins can upload reels content" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'reels-content' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update reels content" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'reels-content' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete reels content" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'reels-content' AND is_admin(auth.uid()));