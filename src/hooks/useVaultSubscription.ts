import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export const useVaultSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["vault-subscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("vault_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching vault subscription:", error);
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  const { data: hasAccess, isLoading: checkingAccess } = useQuery({
    queryKey: ["vault-access", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase.rpc("has_vault_access", {
        _user_id: user.id,
      });

      if (error) {
        console.error("Error checking vault access:", error);
        return false;
      }

      return data === true;
    },
    enabled: !!user?.id,
  });

  const createSubscription = useMutation({
    mutationFn: async (subscriptionData: {
      subscription_type: string;
      payment_amount: number;
      payment_method: string;
      payment_reference?: string;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("vault_subscriptions")
        .insert({
          user_id: user.id,
          ...subscriptionData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault-subscription"] });
      queryClient.invalidateQueries({ queryKey: ["vault-access"] });
      toast.success("تم إنشاء الاشتراك بنجاح");
    },
    onError: (error) => {
      console.error("Error creating subscription:", error);
      toast.error("فشل إنشاء الاشتراك");
    },
  });

  return {
    subscription,
    hasAccess,
    isLoading: isLoading || checkingAccess,
    createSubscription,
  };
};
