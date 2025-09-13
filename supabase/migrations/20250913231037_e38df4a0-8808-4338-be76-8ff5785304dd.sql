-- Create storage bucket for reels videos
INSERT INTO storage.buckets (id, name, public) VALUES ('reels-videos', 'reels-videos', true);

-- Create policies for reels videos bucket
CREATE POLICY "Public can view reels videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'reels-videos');

CREATE POLICY "Admins can upload reels videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'reels-videos' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update reels videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'reels-videos' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete reels videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'reels-videos' AND is_admin(auth.uid()));