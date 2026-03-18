import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CryptoPaymentAddress {
  id: string;
  network_key: string;
  network_name: string;
  supported_assets: string | null;
  address: string;
  memo_tag: string | null;
  warnings: string | null;
  warnings_en: string | null;
  display_order: number;
  is_active: boolean;
}

export function useCryptoPaymentAddresses() {
  const [addresses, setAddresses] = useState<CryptoPaymentAddress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);

    try {
      const { data, error } = await (supabase as any)
        .from("crypto_payment_addresses")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setAddresses((data || []) as CryptoPaymentAddress[]);
    } catch (error) {
      console.error("Error fetching crypto payment addresses:", error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return {
    addresses,
    loading,
    refetch: fetchAddresses,
  };
}
