
CREATE OR REPLACE FUNCTION public.process_wheel_reward(p_user_id uuid, p_reward_type text, p_reward_value numeric, p_spin_cost numeric DEFAULT 0, p_is_bonus boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_xp_token_id uuid;
  v_msra_token_id uuid;
  v_pool_id uuid;
  v_user_amount numeric;
  v_pool_amount numeric;
  v_xp_to_msra_rate numeric;
  v_msra_pool_amount numeric;
BEGIN
  SELECT id INTO v_xp_token_id FROM internal_tokens WHERE symbol = 'XP' AND is_active = true;
  SELECT id INTO v_msra_token_id FROM internal_tokens WHERE symbol = 'MSRA' AND is_active = true;
  SELECT id INTO v_pool_id FROM liquidity_pools WHERE is_active = true ORDER BY created_at LIMIT 1;
  
  IF v_xp_token_id IS NOT NULL AND v_msra_token_id IS NOT NULL THEN
    SELECT 
      (SELECT exchange_rate_usd FROM internal_tokens WHERE id = v_xp_token_id) /
      NULLIF((SELECT exchange_rate_usd FROM internal_tokens WHERE id = v_msra_token_id), 0)
    INTO v_xp_to_msra_rate;
  END IF;
  IF v_xp_to_msra_rate IS NULL THEN v_xp_to_msra_rate := 1; END IF;

  IF p_spin_cost > 0 AND v_xp_token_id IS NOT NULL THEN
    UPDATE internal_wallet_balances 
    SET balance = GREATEST(0, balance - p_spin_cost), updated_at = now()
    WHERE user_id = p_user_id AND token_id = v_xp_token_id;
  END IF;

  IF p_reward_type = 'free_spin' THEN
    IF p_spin_cost > 0 AND v_pool_id IS NOT NULL THEN
      v_msra_pool_amount := ROUND(p_spin_cost * v_xp_to_msra_rate, 4);
      UPDATE liquidity_pools SET total_value_locked = total_value_locked + v_msra_pool_amount, updated_at = now()
      WHERE id = v_pool_id;
      INSERT INTO liquidity_transactions (pool_id, user_id, transaction_type, amount, fee_amount, status, source_type, source_reference, notes)
      VALUES (v_pool_id, p_user_id, 'deposit', v_msra_pool_amount, 0, 'completed', 'wheel_spin_cost', 'wheel_free_spin',
              'تكلفة لفة (جائزة لفات إضافية): ' || p_spin_cost || ' XP → ' || v_msra_pool_amount || ' $MS-RA');
    END IF;
    RETURN jsonb_build_object('success', true, 'user_credited', 0, 'pool_credited', COALESCE(v_msra_pool_amount, 0), 'type', 'free_spin');

  ELSIF p_reward_type = 'xp' AND NOT p_is_bonus THEN
    v_user_amount := ROUND(p_reward_value * 0.8, 2);
    v_pool_amount := ROUND(p_reward_value * 0.2, 2);
    IF v_xp_token_id IS NOT NULL THEN
      INSERT INTO internal_wallet_balances (user_id, token_id, balance)
      VALUES (p_user_id, v_xp_token_id, v_user_amount)
      ON CONFLICT (user_id, token_id) 
      DO UPDATE SET balance = internal_wallet_balances.balance + v_user_amount, updated_at = now();
    END IF;
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
    v_user_amount := ROUND(p_reward_value * 0.8, 4);
    v_pool_amount := ROUND(p_reward_value * 0.2, 4);
    IF v_msra_token_id IS NOT NULL THEN
      INSERT INTO internal_wallet_balances (user_id, token_id, balance)
      VALUES (p_user_id, v_msra_token_id, v_user_amount)
      ON CONFLICT (user_id, token_id) 
      DO UPDATE SET balance = internal_wallet_balances.balance + v_user_amount, updated_at = now();
    END IF;
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
$function$;
