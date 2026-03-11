
-- Family members table
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  relationship TEXT NOT NULL CHECK (relationship IN ('spouse', 'child', 'mother')),
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  national_id TEXT,
  document_front_url TEXT,
  document_back_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_notes TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Users can view their own family members
CREATE POLICY "Users can view own family members"
  ON public.family_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own family members
CREATE POLICY "Users can insert own family members"
  ON public.family_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own family members
CREATE POLICY "Users can update own family members"
  ON public.family_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Users can delete their own family members
CREATE POLICY "Users can delete own family members"
  ON public.family_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all family members
CREATE POLICY "Admins can view all family members"
  ON public.family_members FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Admins can update all family members (for verification)
CREATE POLICY "Admins can update all family members"
  ON public.family_members FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Index for faster queries
CREATE INDEX idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX idx_family_members_verification ON public.family_members(verification_status);
