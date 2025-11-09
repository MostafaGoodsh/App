-- Add two_factor_enabled column to anubis_users table
ALTER TABLE anubis_users 
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;