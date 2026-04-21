-- Blockchain founding contributor applications
CREATE TABLE public.blockchain_contributor_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  contribution_type TEXT NOT NULL DEFAULT 'validator',
  expertise_areas TEXT[],
  experience_summary TEXT,
  motivation TEXT,
  technical_resources TEXT,
  investment_range TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_bca_user_id ON public.blockchain_contributor_applications(user_id);
CREATE INDEX idx_bca_status ON public.blockchain_contributor_applications(status);

ALTER TABLE public.blockchain_contributor_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users view own blockchain applications"
ON public.blockchain_contributor_applications FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own applications
CREATE POLICY "Users create own blockchain applications"
ON public.blockchain_contributor_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending applications
CREATE POLICY "Users update own pending applications"
ON public.blockchain_contributor_applications FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Admins full access
CREATE POLICY "Admins manage all blockchain applications"
ON public.blockchain_contributor_applications FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_bca_updated_at
BEFORE UPDATE ON public.blockchain_contributor_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Notify admins on new application
CREATE OR REPLACE FUNCTION public.notify_admins_on_blockchain_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_name TEXT;
BEGIN
  SELECT full_name INTO v_user_name FROM public.profiles WHERE user_id = NEW.user_id;
  PERFORM public.notify_all_admins(
    'طلب مساهمة في البلوكتشين | New Blockchain Contributor',
    'من ' || COALESCE(v_user_name, NEW.full_name) || ' — نوع المساهمة: ' || NEW.contribution_type,
    'system',
    NEW.id,
    'blockchain_application',
    '/admin/blockchain-applications'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_admins_blockchain_app
AFTER INSERT ON public.blockchain_contributor_applications
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_on_blockchain_application();