-- إضافة بيانات تجريبية لجدول reels_content
INSERT INTO public.reels_content (
  title, 
  description, 
  video_url, 
  thumbnail_url, 
  duration, 
  display_order, 
  is_active
) VALUES 
(
  'فيديو تجريبي 1',
  'هذا فيديو تجريبي لاختبار النظام',
  'https://example.com/video1.mp4',
  'https://example.com/thumb1.jpg',
  30,
  1,
  true
),
(
  'فيديو تجريبي 2', 
  'فيديو تجريبي آخر',
  'https://example.com/video2.mp4',
  'https://example.com/thumb2.jpg',
  45,
  2,
  true
),
(
  'فيديو تجريبي 3',
  'فيديو تجريبي غير نشط',
  'https://example.com/video3.mp4', 
  'https://example.com/thumb3.jpg',
  60,
  3,
  false
);