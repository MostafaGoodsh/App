-- 1) Network Policy table (per role flexible rules)
CREATE TABLE IF NOT EXISTS public.blockchain_network_policy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_type_key text NOT NULL UNIQUE,
  min_points integer NOT NULL DEFAULT 0,
  required_streak_days integer NOT NULL DEFAULT 0,
  kyc_required boolean NOT NULL DEFAULT false,
  allowed_device text NOT NULL DEFAULT 'any', -- any | mobile | desktop
  max_contributors integer,
  revenue_share_percent numeric NOT NULL DEFAULT 0,
  is_open_for_applications boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blockchain_network_policy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "policy_public_read" ON public.blockchain_network_policy
  FOR SELECT USING (true);
CREATE POLICY "policy_admin_insert" ON public.blockchain_network_policy
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "policy_admin_update" ON public.blockchain_network_policy
  FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "policy_admin_delete" ON public.blockchain_network_policy
  FOR DELETE USING (public.is_admin(auth.uid()));

CREATE TRIGGER trg_policy_updated_at BEFORE UPDATE ON public.blockchain_network_policy
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Super Nodes registry
CREATE TABLE IF NOT EXISTS public.blockchain_super_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid, -- nullable: founder/external partner may not have user account
  display_name text NOT NULL,
  display_name_en text,
  entity_type text NOT NULL DEFAULT 'individual', -- founder | institution | government | premium_user | external_partner
  economic_category text NOT NULL DEFAULT 'general', -- coins | rwa | affiliate | regulatory | general
  description text,
  description_en text,
  logo_url text,
  website_url text,
  revenue_share_percent numeric NOT NULL DEFAULT 0,
  governance_weight integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active', -- active | suspended | pending
  is_public boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  assigned_by uuid,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blockchain_super_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "supernodes_public_read" ON public.blockchain_super_nodes
  FOR SELECT USING (is_public = true OR public.is_admin(auth.uid()));
CREATE POLICY "supernodes_admin_insert" ON public.blockchain_super_nodes
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "supernodes_admin_update" ON public.blockchain_super_nodes
  FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "supernodes_admin_delete" ON public.blockchain_super_nodes
  FOR DELETE USING (public.is_admin(auth.uid()));

CREATE TRIGGER trg_supernodes_updated_at BEFORE UPDATE ON public.blockchain_super_nodes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Global blockchain settings
CREATE TABLE IF NOT EXISTS public.blockchain_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_super_nodes_section boolean NOT NULL DEFAULT true,
  show_node_sale_section boolean NOT NULL DEFAULT false,
  node_sale_active boolean NOT NULL DEFAULT false,
  super_nodes_title text NOT NULL DEFAULT 'مجلس السوبر نودز',
  super_nodes_title_en text NOT NULL DEFAULT 'Super Nodes Council',
  super_nodes_description text DEFAULT 'مؤسسات وأفراد موثوقون يساهمون في تأسيس الشبكة',
  super_nodes_description_en text DEFAULT 'Trusted institutions and individuals founding the network',
  node_sale_title text DEFAULT 'بيع النودز الرسمي',
  node_sale_title_en text DEFAULT 'Official Node Sale',
  node_sale_description text,
  node_sale_description_en text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blockchain_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bc_settings_public_read" ON public.blockchain_settings
  FOR SELECT USING (true);
CREATE POLICY "bc_settings_admin_insert" ON public.blockchain_settings
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "bc_settings_admin_update" ON public.blockchain_settings
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE TRIGGER trg_bc_settings_updated_at BEFORE UPDATE ON public.blockchain_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default settings row
INSERT INTO public.blockchain_settings (show_super_nodes_section, show_node_sale_section, node_sale_active)
VALUES (true, false, false);

-- 4) Add 'super_node' contribution type
INSERT INTO public.blockchain_contribution_types
  (type_key, name, name_en, description, description_en, icon, color, required_points, benefits, benefits_en, display_order, is_active)
VALUES
  ('super_node', 'سوبر نود', 'Super Node',
   'مقعد رسمي للمؤسسين والمؤسسات والشركاء الاستراتيجيين', 'Official seat for founders, institutions, and strategic partners',
   '🏛️', '#D4AF37', 0,
   'حصة من رسوم الشبكة + صوت في الحوكمة + ظهور رسمي', 'Revenue share + governance vote + official listing',
   100, true)
ON CONFLICT (type_key) DO NOTHING;

-- Seed default policies for known roles
INSERT INTO public.blockchain_network_policy (contribution_type_key, min_points, kyc_required, allowed_device, revenue_share_percent, is_open_for_applications)
VALUES
  ('observer',       0,    false, 'any',     0,  true),
  ('routine',        10,   false, 'any',     0,  true),
  ('node_operator',  500,  true,  'desktop', 5,  false),
  ('validator',      2000, true,  'desktop', 10, false),
  ('super_node',     0,    true,  'any',     20, false)
ON CONFLICT (contribution_type_key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_supernodes_public ON public.blockchain_super_nodes (is_public, display_order);
CREATE INDEX IF NOT EXISTS idx_supernodes_user ON public.blockchain_super_nodes (user_id);