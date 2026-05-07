import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SidebarItemRow {
  id: string;
  key: string;
  title_ar: string;
  title_en: string | null;
  title_ru: string | null;
  url: string;
  icon_name: string;
  display_order: number;
  is_visible: boolean;
  min_access_level: "none" | "early_access" | "kyc_verified" | "admin";
  require_auth: boolean;
  is_admin_only: boolean;
  section: string;
}

export function useSidebarItems(includeHidden = false) {
  const [items, setItems] = useState<SidebarItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    let q = supabase.from("sidebar_items").select("*").order("display_order", { ascending: true });
    if (!includeHidden) q = q.eq("is_visible", true);
    const { data } = await q;
    setItems((data as SidebarItemRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
    const ch = supabase
      .channel(`sidebar_items_${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "sidebar_items" }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeHidden]);

  return { items, loading, refetch: fetch };
}
