-- Update mining levels with new rates
-- Basic level: 1.2 $Ms-Ra per day (0.05 per hour)
UPDATE public.mining_levels 
SET 
  level_name = 'المستوى الأساسي',
  mining_rate_per_hour = 0.0500,
  required_account_strength = 100
WHERE level_number = 1;

-- Silver level: 2.4 $Ms-Ra per day (0.1 per hour)
UPDATE public.mining_levels 
SET 
  level_name = 'الفضي',
  mining_rate_per_hour = 0.1000,
  required_account_strength = 500
WHERE level_number = 2;

-- Gold level: 3.6 $Ms-Ra per day (0.15 per hour)
UPDATE public.mining_levels 
SET 
  level_name = 'الذهبي',
  mining_rate_per_hour = 0.1500,
  required_account_strength = 1000
WHERE level_number = 3;

-- Insert these levels if they don't exist
INSERT INTO public.mining_levels (level_number, level_name, required_account_strength, mining_rate_per_hour, upgrade_cost)
SELECT 1, 'المستوى الأساسي', 100, 0.0500, 0
WHERE NOT EXISTS (SELECT 1 FROM public.mining_levels WHERE level_number = 1);

INSERT INTO public.mining_levels (level_number, level_name, required_account_strength, mining_rate_per_hour, upgrade_cost)
SELECT 2, 'الفضي', 500, 0.1000, 100
WHERE NOT EXISTS (SELECT 1 FROM public.mining_levels WHERE level_number = 2);

INSERT INTO public.mining_levels (level_number, level_name, required_account_strength, mining_rate_per_hour, upgrade_cost)
SELECT 3, 'الذهبي', 1000, 0.1500, 300
WHERE NOT EXISTS (SELECT 1 FROM public.mining_levels WHERE level_number = 3);