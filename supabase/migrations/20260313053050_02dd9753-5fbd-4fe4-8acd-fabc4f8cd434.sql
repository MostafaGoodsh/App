
-- Function to process wheel rewards with 80/20 distribution and liquidity pool recording
CREATE OR REPLACE FUNCTION public.process_wheel_reward(
  p_user_id uuid,
  p_reward_type text,
  p_reward_value numeric,
  p_spin_cost numeric DEFAULT 0,
  p_is_bonus boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_xp_token_id uuid;
  v_msra_token_id uuid;
  v_pool_id uuid;
  v_user_amount numeric;
  v_pool_amount numeric;
  v_xp_to_msra_rate numeric;
  v_msra_pool_amount numeric;
BEGIN
  -- Get token IDs
  SELECT id INTO v_xp_token_id FROM internal_tokens WHERE symbol = 'XP' AND is_active = true;
  SELECT id INTO v_msra_token_id FROM internal_tokens WHERE symbol = 'MSRA' AND is_active = true;
  
  -- Get general liquidity pool
  SELECT id INTO v_pool_id FROM liquidity_pools WHERE is_active = true ORDER BY created_at LIMIT 1;
  
  -- Calculate XP to MSRA conversion rate
  IF v_xp_token_id IS NOT NULL AND v_msra_token_id IS NOT NULL THEN
    SELECT 
      (SELECT exchange_rate_usd FROM internal_tokens WHERE id = v_xp_token_id) /
      NULLIF((SELECT exchange_rate_usd FROM internal_tokens WHERE id = v_msra_token_id), 0)
    INTO v_xp_to_msra_rate;
  END IF;
  IF v_xp_to_msra_rate IS NULL THEN v_xp_to_msra_rate := 1; END IF;

  -- 1. Deduct spin cost from user XP (if not free)
  IF p_spin_cost > 0 AND v_xp_token_id IS NOT NULL THEN
    UPDATE internal_wallet_balances 
    SET balance = GREATEST(0, balance - p_spin_cost), updated_at = now()
    WHERE user_id = p_user_id AND token_id = v_xp_token_id;
  END IF;

  -- 2. Process based on reward type
  IF p_reward_type = 'xp' AND NOT p_is_bonus THEN
    -- Won XP: 80% to user, 20% to liquidity pool (converted to MS-RA)
    v_user_amount := ROUND(p_reward_value * 0.8, 2);
    v_pool_amount := ROUND(p_reward_value * 0.2, 2);
    
    -- Credit 80% XP to user
    IF v_xp_token_id IS NOT NULL THEN
      INSERT INTO internal_wallet_balances (user_id, token_id, balance)
      VALUES (p_user_id, v_xp_token_id, v_user_amount)
      ON CONFLICT (user_id, token_id) 
      DO UPDATE SET balance = internal_wallet_balances.balance + v_user_amount, updated_at = now();
    END IF;
    
    -- Convert 20% XP to MSRA and add to liquidity pool
    v_msra_pool_amount := ROUND(v_pool_amount * v_xp_to_msra_rate, 4);
    IF v_pool_id IS NOT NULL THEN
      UPDATE liquidity_pools SET total_value_locked = total_value_locked + v_msra_pool_amount, updated_at = now()
      WHERE id = v_pool_id;
      
      INSERT INTO liquidity_transactions (pool_id, user_id, transaction_type, amount, fee_amount, status, source_type, source_reference, notes)
      VALUES (v_pool_id, p_user_id, 'deposit', v_msra_pool_amount, 0, 'completed', 'wheel_win_tax', 'wheel_20pct',
              'خصم 20% من مكسب العجلة: ' || p_reward_value || ' XP → ' || v_msra_pool_amount || ' $MS-RA');
    END IF;
    
    RETURN jsonb_build_object('success', true, 'user_credited', v_user_amount, 'pool_credited', v_msra_pool_amount, 'type', 'xp_win');
    
  ELSIF p_reward_type = 'nothing' THEN
    -- Bonus trigger = user loses XP cost → 100% to liquidity pool (converted to MS-RA)
    IF p_spin_cost > 0 AND v_pool_id IS NOT NULL THEN
      v_msra_pool_amount := ROUND(p_spin_cost * v_xp_to_msra_rate, 4);
      UPDATE liquidity_pools SET total_value_locked = total_value_locked + v_msra_pool_amount, updated_at = now()
      WHERE id = v_pool_id;
      
      INSERT INTO liquidity_transactions (pool_id, user_id, transaction_type, amount, fee_amount, status, source_type, source_reference, notes)
      VALUES (v_pool_id, p_user_id, 'deposit', v_msra_pool_amount, 0, 'completed', 'wheel_loss', 'wheel_bonus_trigger',
              'خسارة العجلة (بونص): ' || p_spin_cost || ' XP → ' || v_msra_pool_amount || ' $MS-RA');
    END IF;
    
    RETURN jsonb_build_object('success', true, 'user_credited', 0, 'pool_credited', COALESCE(v_msra_pool_amount, 0), 'type', 'bonus_trigger');
    
  ELSIF p_is_bonus THEN
    -- Won $MS-RA from bonus ring: 80% to user, 20% to pool
    v_user_amount := ROUND(p_reward_value * 0.8, 4);
    v_pool_amount := ROUND(p_reward_value * 0.2, 4);
    
    -- Credit 80% MSRA to user
    IF v_msra_token_id IS NOT NULL THEN
      INSERT INTO internal_wallet_balances (user_id, token_id, balance)
      VALUES (p_user_id, v_msra_token_id, v_user_amount)
      ON CONFLICT (user_id, token_id) 
      DO UPDATE SET balance = internal_wallet_balances.balance + v_user_amount, updated_at = now();
    END IF;
    
    -- 20% to liquidity pool
    IF v_pool_id IS NOT NULL THEN
      UPDATE liquidity_pools SET total_value_locked = total_value_locked + v_pool_amount, updated_at = now()
      WHERE id = v_pool_id;
      
      INSERT INTO liquidity_transactions (pool_id, user_id, transaction_type, amount, fee_amount, status, source_type, source_reference, notes)
      VALUES (v_pool_id, p_user_id, 'deposit', v_pool_amount, 0, 'completed', 'wheel_bonus_tax', 'wheel_bonus_20pct',
              'خصم 20% من بونص العجلة: ' || p_reward_value || ' $MS-RA → ' || v_pool_amount || ' للمجمع');
    END IF;
    
    RETURN jsonb_build_object('success', true, 'user_credited', v_user_amount, 'pool_credited', v_pool_amount, 'type', 'msra_bonus');
  ELSE
    RETURN jsonb_build_object('success', true, 'user_credited', 0, 'pool_credited', 0, 'type', 'other');
  END IF;
END;
$$;

-- Auto-record completed payments to liquidity pool
CREATE OR REPLACE FUNCTION public.record_payment_to_liquidity_pool()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_pool_id uuid;
  v_msra_amount numeric;
  v_msra_rate numeric;
BEGIN
  -- Only process when payment is completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    SELECT id INTO v_pool_id FROM liquidity_pools WHERE is_active = true ORDER BY created_at LIMIT 1;
    
    IF v_pool_id IS NOT NULL THEN
      -- Get MSRA exchange rate for conversion
      SELECT exchange_rate_usd INTO v_msra_rate FROM internal_tokens WHERE symbol = 'MSRA' AND is_active = true;
      IF v_msra_rate IS NULL OR v_msra_rate = 0 THEN v_msra_rate := 0.01; END IF;
      
      -- Convert payment amount (EGP) to approximate MSRA value
      -- Using EGP→USD (0.02) then USD→MSRA
      v_msra_amount := ROUND((NEW.amount * 0.02) / v_msra_rate, 4);
      
      UPDATE liquidity_pools SET total_value_locked = total_value_locked + v_msra_amount, 
             total_volume_24h = total_volume_24h + v_msra_amount, updated_at = now()
      WHERE id = v_pool_id;
      
      INSERT INTO liquidity_transactions (pool_id, user_id, transaction_type, amount, fee_amount, status, source_type, source_reference, notes)
      VALUES (v_pool_id, NEW.user_id, 'deposit', v_msra_amount, 0, 'completed', 'payment', NEW.id::text,
              'دفعة مكتملة: ' || NEW.amount || ' ' || NEW.currency || ' عبر ' || NEW.payment_method);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for payment recording
DROP TRIGGER IF EXISTS trg_record_payment_to_liquidity ON public.payment_transactions;
CREATE TRIGGER trg_record_payment_to_liquidity
  AFTER INSERT OR UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.record_payment_to_liquidity_pool();
