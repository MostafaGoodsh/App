
ALTER TABLE public.profile_customization
ADD COLUMN IF NOT EXISTS visible_fields jsonb DEFAULT '{"email":true,"phone":true,"country":true,"age":true,"date_of_birth":true,"marital_status":true,"job_title":true,"join_date":true,"bio":true}'::jsonb;
