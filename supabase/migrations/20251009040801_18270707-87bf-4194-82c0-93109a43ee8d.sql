-- تحديث buckets لجعلها عامة
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('reels-videos', 'learning-media');