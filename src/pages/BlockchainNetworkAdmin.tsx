import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, XCircle, Coins, Network, RefreshCw } from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";

interface Token {
  id: string;
  symbol: string;
  name: string;
  is_active: boolean;
  firefly_pool_id: string | null;
  firefly_pool_status: string | null;
  firefly_namespace: string | null;
}

interface UserKey {
  id: string;
  user_id: string;
  firefly_identity: string | null;
  eth_address: string | null;
  status: string;
  created_at: string;
  error_message: string | null;
}

export default function BlockchainNetworkAdmin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [userKeys, setUserKeys] = useState<UserKey[]>([]);
  const [networkStatus, setNetworkStatus] = useState<any>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    const [t, k] = await Promise.all([
      supabase.from("internal_tokens").select("id,symbol,name,is_active,firefly_pool_id,firefly_pool_status,firefly_namespace").order("symbol"),
      supabase.from("blockchain_user_keys").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    setTokens((t.data as any) || []);
    setUserKeys((k.data as any) || []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const testConnection = async () => {
    setBusy("status");
    try {
      const { data, error } = await supabase.functions.invoke("firefly-status");
      if (error) throw error;
      setNetworkStatus(data);
      toast({ title: data?.success ? "✅ متصل بشبكة Kaleido" : "⚠️ مشكلة في الاتصال" });
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const createPool = async (token: Token) => {
    setBusy(token.id);
    try {
      const { data, error } = await supabase.functions.invoke("firefly-create-token-pool", {
        body: { name: token.symbol, symbol: token.symbol, type: "fungible", namespace: token.firefly_namespace || "XcX" },
      });
      if (error) throw error;
      const poolId = (data as any)?.pool?.id || (data as any)?.pool?.tx?.id || null;
      const status = (data as any)?.success ? "creating" : "failed";
      await supabase.from("internal_tokens").update({
        firefly_pool_id: poolId,
        firefly_pool_status: status,
      }).eq("id", token.id);
      toast({ title: "✅ تم إرسال طلب إنشاء Pool لـ " + token.symbol });
      loadAll();
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const stats = {
    total: userKeys.length,
    active: userKeys.filter(k => k.status === "active").length,
    pending: userKeys.filter(k => k.status === "pending").length,
    failed: userKeys.filter(k => k.status === "failed").length,
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <AdminPageShell withContainer containerClassName="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Network className="w-6 h-6 text-primary" /> شبكة Kaleido (FireFly)
        </h1>
        <p className="text-sm text-muted-foreground">اختبار الاتصال، إنشاء Token Pools، ومراقبة مفاتيح المستخدمين</p>
      </div>

      {/* Connection */}
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">حالة الاتصال</CardTitle>
          <Button onClick={testConnection} size="sm" disabled={busy === "status"}>
            {busy === "status" ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} اختبار
          </Button>
        </CardHeader>
        <CardContent>
          {networkStatus ? (
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                {networkStatus.success ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-destructive" />}
                <span>{networkStatus.success ? "متصل" : "غير متصل"} — HTTP {networkStatus.httpStatus}</span>
              </div>
              <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-40">{JSON.stringify(networkStatus, null, 2)}</pre>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">اضغط "اختبار" لفحص الاتصال بالشبكة</p>
          )}
        </CardContent>
      </Card>

      {/* User Keys Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <Card><CardContent className="p-3 text-center"><div className="text-xs text-muted-foreground">إجمالي</div><div className="text-xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><div className="text-xs text-muted-foreground">نشط</div><div className="text-xl font-bold text-green-500">{stats.active}</div></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><div className="text-xs text-muted-foreground">معلق</div><div className="text-xl font-bold text-amber-500">{stats.pending}</div></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><div className="text-xs text-muted-foreground">فشل</div><div className="text-xl font-bold text-destructive">{stats.failed}</div></CardContent></Card>
      </div>

      {/* Token Pools */}
      <Card className="mb-4">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Coins className="w-4 h-4" /> Token Pools</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {tokens.filter(t => t.is_active).map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
              <div>
                <p className="font-bold" dir="ltr">{t.symbol}</p>
                <p className="text-xs text-muted-foreground">{t.name}</p>
                {t.firefly_pool_id && <p className="text-[10px] text-muted-foreground font-mono mt-1" dir="ltr">{t.firefly_pool_id}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={t.firefly_pool_status === "creating" || t.firefly_pool_status === "active" ? "default" : "secondary"}>
                  {t.firefly_pool_status || "not_created"}
                </Badge>
                <Button size="sm" variant="outline" onClick={() => createPool(t)} disabled={busy === t.id}>
                  {busy === t.id ? <Loader2 className="w-3 h-3 animate-spin" /> : (t.firefly_pool_id ? "إعادة" : "إنشاء")}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent User Keys */}
      <Card>
        <CardHeader><CardTitle className="text-base">آخر مفاتيح المستخدمين</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {userKeys.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">لا يوجد مستخدمين مسجلين على الشبكة بعد</p>}
          {userKeys.map(k => (
            <div key={k.id} className="flex items-center justify-between p-2 border border-border/50 rounded text-xs">
              <div className="flex-1 min-w-0">
                <p className="font-mono truncate" dir="ltr">{k.eth_address || k.firefly_identity || k.user_id}</p>
                {k.error_message && <p className="text-destructive truncate">{k.error_message}</p>}
              </div>
              <Badge variant={k.status === "active" ? "default" : k.status === "failed" ? "destructive" : "secondary"}>
                {k.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}
