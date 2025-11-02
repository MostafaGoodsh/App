import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnubisSubscription {
  id: string;
  user_id: string;
  subscription_type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

interface CreateSubscriptionData {
  subscription_type: string;
  status?: string;
}

export const useAnubisSubscription = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user has active anubis subscription
  const { data: hasAccess, isLoading: checkingAccess } = useQuery({
    queryKey: ["anubis-access"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('check_anubis_subscription_access', {
        user_uuid: user.id
      });

      if (error) {
        console.error("Error checking anubis access:", error);
        return false;
      }

      return data === true;
    },
  });

  // Get user's anubis subscription
  const { data: subscription } = useQuery({
    queryKey: ["anubis-subscription"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("anubis_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching subscription:", error);
        return null;
      }

      return data as AnubisSubscription | null;
    },
  });

  // Create new subscription
  const createSubscription = useMutation({
    mutationFn: async (subscriptionData: CreateSubscriptionData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("anubis_subscriptions")
        .insert({
          user_id: user.id,
          subscription_type: subscriptionData.subscription_type,
          status: subscriptionData.status || 'pending',
          start_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anubis-subscription"] });
      queryClient.invalidateQueries({ queryKey: ["anubis-access"] });
      toast({
        title: "تم التسجيل بنجاح",
        description: "مرحباً بك في خزانة أنوبيس الرقمية",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشل التسجيل",
      });
    },
  });

  return {
    hasAccess,
    checkingAccess,
    subscription,
    createSubscription,
  };
};