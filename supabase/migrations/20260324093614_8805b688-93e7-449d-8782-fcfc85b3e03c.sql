
-- ============================================
-- إصلاح الثغرات الأمنية الخطيرة
-- ============================================

-- 1. حماية stream_key في active_live_streams
DROP POLICY IF EXISTS "الجميع يمكنهم مشاهدة البثوث النشط" ON public.active_live_streams;
CREATE POLICY "Public can view active streams" ON public.active_live_streams
  FOR SELECT TO authenticated USING (is_active = true);

-- 2. حماية password_hash في anubis_users
DROP POLICY IF EXISTS "Users can read own data" ON public.anubis_users;
CREATE POLICY "Users can read own safe data" ON public.anubis_users
  FOR SELECT TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update own data" ON public.anubis_users;
CREATE POLICY "Users can update own safe fields" ON public.anubis_users
  FOR UPDATE TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- 3. إصلاح point_to_token_conversions
DROP POLICY IF EXISTS "System can update conversion status" ON public.point_to_token_conversions;
CREATE POLICY "Only admins can update conversion status" ON public.point_to_token_conversions
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 4. إصلاح user_points_balance
DROP POLICY IF EXISTS "System can update points balance" ON public.user_points_balance;
CREATE POLICY "Only admins can update points balance" ON public.user_points_balance
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 5. إصلاح internal_wallet_balances
DROP POLICY IF EXISTS "System can update balances" ON public.internal_wallet_balances;
CREATE POLICY "Only admins can update wallet balances" ON public.internal_wallet_balances
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 6. إصلاح withdrawal_requests
DROP POLICY IF EXISTS "Service role can update withdrawal requests" ON public.withdrawal_requests;
CREATE POLICY "Only admins can update withdrawal requests" ON public.withdrawal_requests
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 7. إصلاح pending_deposits
DROP POLICY IF EXISTS "System can insert pending deposits" ON public.pending_deposits;
DROP POLICY IF EXISTS "System can update deposit status" ON public.pending_deposits;
CREATE POLICY "Only admins can insert pending deposits" ON public.pending_deposits
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Only admins can update pending deposits" ON public.pending_deposits
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 8. إصلاح mining_history
DROP POLICY IF EXISTS "System can insert mining history" ON public.mining_history;
CREATE POLICY "Only admins can insert mining history" ON public.mining_history
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- 9. إصلاح anubis_2fa_codes
DROP POLICY IF EXISTS "System can insert 2FA codes" ON public.anubis_2fa_codes;
DROP POLICY IF EXISTS "System can update 2FA codes" ON public.anubis_2fa_codes;
CREATE POLICY "Only admins can insert 2FA codes" ON public.anubis_2fa_codes
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Only admins can update 2FA codes" ON public.anubis_2fa_codes
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 10. إصلاح notifications
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "Only admins can create notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- 11. إصلاح user_roles - تقييد القراءة
DROP POLICY IF EXISTS "Anyone can read roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- 12. إصلاح user_follows
DROP POLICY IF EXISTS "Anyone can view follows" ON public.user_follows;
CREATE POLICY "Authenticated users can view follows" ON public.user_follows
  FOR SELECT TO authenticated
  USING (true);

-- 13. إصلاح live_stream_views
DROP POLICY IF EXISTS "الجميع يمكنهم قراءة المشاهدات" ON public.live_stream_views;
CREATE POLICY "Authenticated users can view stream views" ON public.live_stream_views
  FOR SELECT TO authenticated
  USING (true);
