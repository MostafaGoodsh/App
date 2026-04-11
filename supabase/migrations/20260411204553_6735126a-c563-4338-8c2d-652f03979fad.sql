UPDATE storage.buckets 
SET allowed_mime_types = array_cat(
  COALESCE(allowed_mime_types, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ARRAY['video/mp4','video/webm']
)
WHERE id = 'content-backgrounds'
AND (allowed_mime_types IS NULL OR NOT allowed_mime_types @> ARRAY['video/mp4']);