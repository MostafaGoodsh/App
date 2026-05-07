import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Search, UserCheck, UserX } from "lucide-react";

interface Profile {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  has_early_access: boolean;
}

export default function EarlyAccessManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles-early-access"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone, has_early_access")
        .order("full_name");

      if (error) throw error;
      return data as Profile[];
    },
  });

  const toggleAccessMutation = useMutation({
    mutationFn: async ({ userId, hasAccess }: { userId: string; hasAccess: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ has_early_access: hasAccess })
        .eq("user_id", userId);

      if (error) throw error;

      // Send welcome notification on approval
      if (hasAccess) {
        await supabase.from("notifications").insert({
          user_id: userId,
          type: "welcome",
          title: "🎉 مرحباً بك في منصة مصر الرقمية",
          message:
            "تم قبول طلبك بنجاح! نرحب بك في عائلتنا. ابدأ رحلتك الآن بإكمال الاستبيان التعريفي ثم تقديم تحقق الهوية للحصول على الوصول الكامل لكل مزايا المنصة.",
          action_url: "/surveys",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles-early-access"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث حالة الوصول المبكر",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة الوصول",
        variant: "destructive",
      });
      console.error("Error toggling access:", error);
    },
  });

  const grantAllAccessMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ has_early_access: true })
        .neq("user_id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles-early-access"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم منح الوصول لجميع المستخدمين",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء منح الوصول",
        variant: "destructive",
      });
      console.error("Error granting all access:", error);
    },
  });

  const revokeAllAccessMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ has_early_access: false })
        .neq("user_id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles-early-access"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم إلغاء الوصول لجميع المستخدمين",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إلغاء الوصول",
        variant: "destructive",
      });
      console.error("Error revoking all access:", error);
    },
  });

  const filteredProfiles = profiles?.filter(profile => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      profile.full_name?.toLowerCase().includes(query) ||
      profile.phone?.includes(query)
    );
  });

  const accessCount = profiles?.filter(p => p.has_early_access).length || 0;
  const totalCount = profiles?.length || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>إدارة الوصول المبكر</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="البحث عن مستخدم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => grantAllAccessMutation.mutate()}
                disabled={grantAllAccessMutation.isPending}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                منح الكل
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => revokeAllAccessMutation.mutate()}
                disabled={revokeAllAccessMutation.isPending}
              >
                <UserX className="h-4 w-4 mr-2" />
                إلغاء الكل
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            المستخدمون الذين لديهم وصول: {accessCount} من {totalCount}
          </div>

          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : (
            <div className="space-y-2">
              {filteredProfiles?.map((profile) => (
                <div
                  key={profile.user_id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{profile.full_name || "بدون اسم"}</div>
                    <div className="text-sm text-muted-foreground">{profile.phone}</div>
                  </div>
                  <Switch
                    checked={profile.has_early_access}
                    onCheckedChange={(checked) =>
                      toggleAccessMutation.mutate({
                        userId: profile.user_id,
                        hasAccess: checked,
                      })
                    }
                    disabled={toggleAccessMutation.isPending}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
