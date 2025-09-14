-- إصلاح مشاكل الأمان في الدوال عبر إضافة search_path آمن

-- تحديث الدوال التي تحتاج search_path آمن
ALTER FUNCTION public.update_user_engagement_stats(uuid) SET search_path = 'public';
ALTER FUNCTION public.calculate_user_points(uuid) SET search_path = 'public';
ALTER FUNCTION public.update_user_points_balance(uuid) SET search_path = 'public';
ALTER FUNCTION public.validate_wallet_access(uuid, text, text, inet) SET search_path = 'public';
ALTER FUNCTION public.secure_wallet_access(uuid, text, text, text) SET search_path = 'public';
ALTER FUNCTION public.create_wallet_mfa_session(uuid) SET search_path = 'public';
ALTER FUNCTION public.register_trusted_device(text, text) SET search_path = 'public';
ALTER FUNCTION public.update_mining_progress(uuid) SET search_path = 'public';
ALTER FUNCTION public.complete_daily_task(uuid) SET search_path = 'public';
ALTER FUNCTION public.get_secure_transaction_export(text, timestamptz, timestamptz) SET search_path = 'public';
ALTER FUNCTION public.get_secure_profile_export() SET search_path = 'public';
ALTER FUNCTION public.process_confirmed_deposit() SET search_path = 'public';
ALTER FUNCTION public.mask_transaction_data(numeric, uuid, text, text) SET search_path = 'public';
ALTER FUNCTION public.get_identity_verification_admin_view() SET search_path = 'public';
ALTER FUNCTION public.get_profiles_admin_view() SET search_path = 'public';
ALTER FUNCTION public.update_kyc_status(uuid, text, text) SET search_path = 'public';
ALTER FUNCTION public.calculate_account_strength(uuid) SET search_path = 'public';
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';
ALTER FUNCTION public.make_first_user_admin() SET search_path = 'public';
ALTER FUNCTION public.grant_admin_role(text) SET search_path = 'public';
ALTER FUNCTION public.log_transaction_access() SET search_path = 'public';
ALTER FUNCTION public.upload_avatar(text, bytea, text) SET search_path = 'public, storage';
ALTER FUNCTION public.update_likes_count() SET search_path = 'public';
ALTER FUNCTION public.update_comments_count() SET search_path = 'public';
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = 'public';
ALTER FUNCTION public.is_admin(uuid) SET search_path = 'public';
ALTER FUNCTION public.mask_contact_info(text, text) SET search_path = 'public';
ALTER FUNCTION public.log_profile_update() SET search_path = 'public';