
CREATE OR REPLACE FUNCTION public.execute_wheel_spin(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings record;
  v_today date := current_date;
  v_today_spins integer;
  v_is_free boolean;
  v_spin_cost integer;
  v_xp_token_id uuid;
  v_user_xp numeric;
  v_total_prob numeric;
  v_rand numeric;
  v_cumulative numeric := 0;
  v_winner record;
  v_reward_result jsonb;
BEGIN
  -- Get wheel settings
  SELECT * INTO v_settings FROM wheel_settings LIMIT 1;
  IF v_settings IS NULL OR NOT v_settings.is_active THEN
    RETURN jsonb_build_object('success', false, 'error', 'العجلة غير متاحة حالياً');
  END IF;

  -- Count today's spins
  SELECT COUNT(*) INTO v_today_spins
  FROM wheel_spin_history
  WHERE user_id = p_user_id AND spin_date = v_today;

  -- Determine if free
  v_is_free := v_today_spins < v_settings.free_spins_per_day;
  v_spin_cost := CASE WHEN v_is_free THEN 0 ELSE v_settings.spin_cost_xp END;

  -- If not free, check XP balance
  IF NOT v_is_free THEN
    IF v_spin_cost <= 0 THEN
      RETURN jsonb_build_object('success', false, 'error', 'لا يمكنك التدوير أكثر اليوم');
    END IF;
    SELECT id INTO v_xp_token_id FROM internal_tokens WHERE symbol = 'XP' AND is_active = true;
    IF v_xp_token_id IS NOT NULL THEN
      SELECT COALESCE(balance, 0) INTO v_user_xp
      FROM internal_wallet_balances
      WHERE user_id = p_user_id AND token_id = v_xp_token_id;
      IF COALESCE(v_user_xp, 0) < v_spin_cost THEN
        RETURN jsonb_build_object('success', false, 'error', 'رصيد XP غير كافي');
      END IF;
    END IF;
  END IF;

  -- Weighted random selection
  SELECT SUM(probability) INTO v_total_prob FROM wheel_segments WHERE is_active = true;
  IF v_total_prob IS NULL OR v_total_prob <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'لا توجد شرائح متاحة');
  END IF;

  v_rand := random() * v_total_prob;
  
  FOR v_winner IN 
    SELECT * FROM wheel_segments WHERE is_active = true ORDER BY display_order
  LOOP
    v_cumulative := v_cumulative + v_winner.probability;
    IF v_rand <= v_cumulative THEN
      EXIT;
    END IF;
  END LOOP;

  -- Record spin
  INSERT INTO wheel_spin_history (user_id, segment_id, reward_type, reward_value, xp_cost, spin_date)
  VALUES (p_user_id, v_winner.id, v_winner.reward_type, v_winner.reward_value, v_spin_cost, v_today);

  -- Process reward
  SELECT process_wheel_reward(p_user_id, v_winner.reward_type, v_winner.reward_value, v_spin_cost, false)
  INTO v_reward_result;

  RETURN jsonb_build_object(
    'success', true,
    'segment', jsonb_build_object(
      'id', v_winner.id,
      'label', v_winner.label,
      'label_en', v_winner.label_en,
      'reward_type', v_winner.reward_type,
      'reward_value', v_winner.reward_value,
      'reward_description', v_winner.reward_description,
      'color', v_winner.color,
      'probability', v_winner.probability,
      'display_order', v_winner.display_order
    ),
    'reward_result', v_reward_result,
    'is_free', v_is_free,
    'spin_cost', v_spin_cost
  );
END;
$$;
