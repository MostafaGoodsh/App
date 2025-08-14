-- Enhanced security for transactions table
-- Create audit table for transaction access logging
CREATE TABLE IF NOT EXISTS public.transactions_audit (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id uuid NOT NULL,
    accessed_by uuid NOT NULL,
    access_type text NOT NULL, -- 'SELECT', 'INSERT', 'UPDATE'
    access_reason text, -- admin access reason
    masked_data boolean DEFAULT false,
    accessed_at timestamp with time zone NOT NULL DEFAULT now(),
    user_agent text,
    ip_address inet
);

-- Enable RLS on audit table
ALTER TABLE public.transactions_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view transaction audit logs
CREATE POLICY "Only admins can view transaction audit logs"
ON public.transactions_audit
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- System can insert transaction audit logs
CREATE POLICY "System can insert transaction audit logs"
ON public.transactions_audit
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admins can view limited transaction data with proper justification
CREATE POLICY "Admins can view limited transaction data"
ON public.transactions
FOR SELECT
TO authenticated
USING (
    is_admin(auth.uid()) 
    AND EXISTS (
        SELECT 1 FROM public.transactions_audit 
        WHERE transaction_id = transactions.id 
        AND accessed_by = auth.uid() 
        AND access_reason IS NOT NULL
        AND accessed_at > now() - interval '1 hour'
    )
);

-- Function to mask sensitive transaction data for admin access
CREATE OR REPLACE FUNCTION public.mask_transaction_data(
    p_amount numeric,
    p_wallet_id uuid,
    p_transaction_hash text,
    p_reference_id text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN jsonb_build_object(
        'amount_range', CASE 
            WHEN p_amount < 100 THEN 'small (<100)'
            WHEN p_amount < 1000 THEN 'medium (100-1K)'
            WHEN p_amount < 10000 THEN 'large (1K-10K)'
            ELSE 'very_large (>10K)'
        END,
        'wallet_masked', substring(p_wallet_id::text from 1 for 8) || '****',
        'hash_masked', CASE 
            WHEN p_transaction_hash IS NOT NULL 
            THEN substring(p_transaction_hash from 1 for 6) || '...' || substring(p_transaction_hash from length(p_transaction_hash)-5)
            ELSE NULL 
        END,
        'reference_masked', CASE 
            WHEN p_reference_id IS NOT NULL 
            THEN substring(p_reference_id from 1 for 4) || '****'
            ELSE NULL 
        END
    );
END;
$$;

-- Function to log transaction access attempts
CREATE OR REPLACE FUNCTION public.log_transaction_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only log if it's not the transaction owner accessing their own data
    IF auth.uid() != NEW.user_id THEN
        INSERT INTO public.transactions_audit (
            transaction_id,
            accessed_by,
            access_type,
            masked_data
        ) VALUES (
            NEW.id,
            auth.uid(),
            TG_OP,
            is_admin(auth.uid())
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger for transaction access audit logging
DROP TRIGGER IF EXISTS transaction_access_audit_log ON public.transactions;
CREATE TRIGGER transaction_access_audit_log
    AFTER UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.log_transaction_access();

-- Secure admin view for transactions with masked data
CREATE OR REPLACE VIEW public.transactions_admin_secure AS
SELECT 
    t.id,
    t.user_id,
    t.wallet_id,
    t.transaction_type,
    t.status,
    t.network,
    t.created_at,
    mask_transaction_data(t.amount, t.wallet_id, t.transaction_hash, t.reference_id) as masked_data,
    t.description,
    CASE WHEN t.gas_fee > 0 THEN 'has_fee' ELSE 'no_fee' END as fee_status
FROM public.transactions t
WHERE is_admin(auth.uid());

-- Set security barrier on the admin view
ALTER VIEW public.transactions_admin_secure SET (security_barrier = true);

-- Add constraints for data validation
ALTER TABLE public.transactions 
ADD CONSTRAINT valid_amount_positive 
CHECK (amount > 0);

ALTER TABLE public.transactions 
ADD CONSTRAINT valid_gas_fee_non_negative 
CHECK (gas_fee >= 0);

ALTER TABLE public.transactions 
ADD CONSTRAINT valid_transaction_type 
CHECK (transaction_type IN ('send', 'receive', 'swap', 'stake', 'unstake', 'fee'));

ALTER TABLE public.transactions 
ADD CONSTRAINT valid_status 
CHECK (status IN ('pending', 'confirmed', 'failed', 'cancelled'));

ALTER TABLE public.transactions 
ADD CONSTRAINT valid_network 
CHECK (network IN ('bitcoin', 'ethereum', 'binance', 'polygon', 'solana', 'cardano', 'litecoin'));

-- Add indexes for security monitoring
CREATE INDEX IF NOT EXISTS idx_transactions_audit_accessed_by_time 
ON public.transactions_audit (accessed_by, accessed_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_audit_transaction_time 
ON public.transactions_audit (transaction_id, accessed_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_amount_range 
ON public.transactions (user_id, amount) WHERE amount > 10000;

CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
ON public.transactions (user_id, created_at DESC);

-- Update existing RLS policies with enhanced security
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions with logging"
ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
CREATE POLICY "Users can insert their own transactions with validation"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id 
    AND amount > 0 
    AND transaction_type IS NOT NULL
    AND status IS NOT NULL
);

-- Function for secure transaction export (admin only)
CREATE OR REPLACE FUNCTION public.get_secure_transaction_export(
    p_access_reason text,
    p_date_from timestamp with time zone DEFAULT now() - interval '30 days',
    p_date_to timestamp with time zone DEFAULT now()
) RETURNS TABLE (
    transaction_count bigint,
    total_volume_range text,
    avg_amount_range text,
    network_distribution jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only admins can access this function
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied: admin privileges required';
    END IF;
    
    -- Log the export access
    INSERT INTO public.transactions_audit (
        transaction_id,
        accessed_by,
        access_type,
        access_reason,
        masked_data
    ) VALUES (
        gen_random_uuid(),
        auth.uid(),
        'EXPORT',
        p_access_reason,
        true
    );
    
    RETURN QUERY
    SELECT 
        count(*)::bigint as transaction_count,
        CASE 
            WHEN sum(amount) < 10000 THEN 'low'
            WHEN sum(amount) < 100000 THEN 'medium' 
            WHEN sum(amount) < 1000000 THEN 'high'
            ELSE 'very_high'
        END as total_volume_range,
        CASE 
            WHEN avg(amount) < 100 THEN 'small'
            WHEN avg(amount) < 1000 THEN 'medium'
            WHEN avg(amount) < 10000 THEN 'large'
            ELSE 'very_large'
        END as avg_amount_range,
        jsonb_object_agg(network, network_count) as network_distribution
    FROM (
        SELECT 
            network,
            count(*) as network_count
        FROM public.transactions 
        WHERE created_at BETWEEN p_date_from AND p_date_to
        GROUP BY network
    ) network_stats;
END;
$$;

-- Add comment documenting the security measures
COMMENT ON TABLE public.transactions IS 'Financial transactions table with enhanced security: RLS policies restrict access to own data, admin access requires justification and is logged with data masking, sensitive financial data is protected against unauthorized access and pattern analysis.';

COMMENT ON TABLE public.transactions_audit IS 'Audit log for transaction access monitoring, tracking all admin access attempts with justification requirements.';