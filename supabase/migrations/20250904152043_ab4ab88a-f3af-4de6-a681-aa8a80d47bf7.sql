-- إزالة القيد المرجعي مؤقتاً
ALTER TABLE user_mining_profiles 
DROP CONSTRAINT IF EXISTS user_mining_profiles_current_level_fkey;

-- حذف جميع المستويات الحالية
DELETE FROM mining_levels;

-- إعادة تعيين sequence
ALTER SEQUENCE mining_levels_id_seq RESTART WITH 1;

-- إدراج المستويات الثلاثة الجديدة
INSERT INTO mining_levels (level_number, level_name, required_account_strength, mining_rate_per_hour, upgrade_cost) VALUES
(1, 'الأساسي', 0, 1.0, 0.00),
(2, 'الفضي', 1000, 5.0, 500.00),
(3, 'الذهبي', 5000, 20.0, 2000.00);

-- تحديث ملفات المستخدمين: إذا كان المستوى أعلى من 3، اجعله 3
UPDATE user_mining_profiles 
SET current_level = LEAST(current_level, 3),
    updated_at = now()
WHERE current_level > 3;

-- إعادة إنشاء القيد المرجعي
ALTER TABLE user_mining_profiles 
ADD CONSTRAINT user_mining_profiles_current_level_fkey 
FOREIGN KEY (current_level) REFERENCES mining_levels(level_number);