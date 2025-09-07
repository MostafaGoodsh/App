-- إزالة القيود الموجودة وإعادة إنشاؤها مع CASCADE
-- هذا سيسمح بحذف المهام حتى لو كان هناك مستخدمون أكملوها

-- إزالة القيود الموجودة
ALTER TABLE user_personality_completions 
DROP CONSTRAINT IF EXISTS user_personality_completions_task_id_fkey;

ALTER TABLE user_media_completions 
DROP CONSTRAINT IF EXISTS user_media_completions_media_id_fkey;

-- إعادة إنشاء القيود مع CASCADE DELETE
ALTER TABLE user_personality_completions 
ADD CONSTRAINT user_personality_completions_task_id_fkey 
FOREIGN KEY (task_id) REFERENCES personality_development_tasks(id) 
ON DELETE CASCADE;

ALTER TABLE user_media_completions 
ADD CONSTRAINT user_media_completions_media_id_fkey 
FOREIGN KEY (media_id) REFERENCES daily_media_content(id) 
ON DELETE CASCADE;