-- حذف البثوث القديمة (أكثر من ساعة)
DELETE FROM active_live_streams 
WHERE started_at < NOW() - INTERVAL '1 hour';

-- إنشاء function لحذف البثوث القديمة تلقائياً
CREATE OR REPLACE FUNCTION cleanup_old_live_streams()
RETURNS void AS $$
BEGIN
  DELETE FROM active_live_streams 
  WHERE started_at < NOW() - INTERVAL '1 hour'
     OR (is_active = false AND ended_at < NOW() - INTERVAL '1 hour');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء trigger لتنظيف البثوث عند إضافة بث جديد
CREATE OR REPLACE FUNCTION trigger_cleanup_old_streams()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM cleanup_old_live_streams();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_cleanup_old_streams ON active_live_streams;
CREATE TRIGGER auto_cleanup_old_streams
  AFTER INSERT ON active_live_streams
  FOR EACH ROW
  EXECUTE FUNCTION trigger_cleanup_old_streams();