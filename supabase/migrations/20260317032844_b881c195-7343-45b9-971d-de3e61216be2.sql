
ALTER TABLE public.wheel_segments DROP CONSTRAINT wheel_segments_reward_type_check;
ALTER TABLE public.wheel_segments ADD CONSTRAINT wheel_segments_reward_type_check 
  CHECK (reward_type = ANY (ARRAY['xp','tokens','badge','nothing','custom','upgrade','free_spin']));

INSERT INTO public.wheel_segments (label, label_en, reward_type, reward_value, color, probability, display_order, is_active)
VALUES ('ترقية', 'Upgrade', 'upgrade', 0, '#2E8B57', 0.8, 99, true);
