-- توحيد كل العملات تحت نظام XP واحد

-- تحديث عملة POINTS لتصبح XP الرئيسية
UPDATE internal_tokens 
SET 
  symbol = 'XP',
  name = 'نقاط الخبرة',
  description = 'نقاط الخبرة الموحدة - اكسبها من المهام، التعدين، والشحن',
  exchange_rate_usd = 0.001,
  is_base_currency = true,
  is_active = true,
  updated_at = now()
WHERE symbol = 'POINTS';

-- إيقاف العملات الأخرى
UPDATE internal_tokens 
SET 
  is_active = false,
  updated_at = now()
WHERE symbol IN ('GOLD', 'REWARDS', 'GEMS');

-- دمج أرصدة العملات القديمة في XP
WITH merged_balances AS (
  SELECT 
    user_id,
    SUM(balance) as total_balance
  FROM internal_wallet_balances wb
  JOIN internal_tokens it ON wb.token_id = it.id
  WHERE it.symbol IN ('POINTS', 'GOLD', 'REWARDS', 'GEMS')
  GROUP BY user_id
),
xp_token AS (
  SELECT id FROM internal_tokens WHERE symbol = 'XP' LIMIT 1
)
INSERT INTO internal_wallet_balances (user_id, token_id, balance)
SELECT 
  mb.user_id,
  xt.id,
  mb.total_balance
FROM merged_balances mb
CROSS JOIN xp_token xt
ON CONFLICT (user_id, token_id) 
DO UPDATE SET 
  balance = internal_wallet_balances.balance + EXCLUDED.balance,
  updated_at = now();

-- حذف الأرصدة القديمة للعملات غير النشطة
DELETE FROM internal_wallet_balances 
WHERE token_id IN (
  SELECT id FROM internal_tokens WHERE symbol IN ('GOLD', 'REWARDS', 'GEMS')
);