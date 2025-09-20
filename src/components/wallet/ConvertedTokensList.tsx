import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Coins, RefreshCw, ExternalLink, Copy, CheckCircle, Clock, AlertCircle
} from "lucide-react";

interface ConvertedToken {
  id: string;
  points_amount: number;
  token_amount: number;
  conversion_rate: number;
  token_mint_address: string;
  transaction_signature: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at: string;
}

export const ConvertedTokensList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tokens, setTokens] = useState<ConvertedToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  const fetchConvertedTokens = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get conversion settings for token info
      const { data: settingsData } = await supabase
        .from('conversion_settings')
        .select('*')
        .eq('is_active', true)
        .single();
      
      setSettings(settingsData);

      // Get user's conversion history
      const { data, error } = await supabase
        .from('point_to_token_conversions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTokens((data || []) as ConvertedToken[]);
    } catch (error) {
      console.error('Error fetching converted tokens:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل العملات المحولة",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConvertedTokens();
  }, [user]);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({ title: "تم النسخ", description: "تم نسخ العنوان إلى الحافظة" });
  };

  const openSolscan = (address: string, type: 'token' | 'tx') => {
    const baseUrl = 'https://solscan.io';
    const url = type === 'token' 
      ? `${baseUrl}/token/${address}?cluster=devnet`
      : `${baseUrl}/tx/${address}?cluster=devnet`;
    window.open(url, '_blank');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'processing':
        return 'جاري المعالجة';
      case 'failed':
        return 'فشل';
      default:
        return 'في الانتظار';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            العملات المحولة ({tokens.length})
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchConvertedTokens}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        <CardDescription>
          العملات التي تم تحويلها من النقاط على شبكة Solana Devnet
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="mr-2">جاري تحميل العملات...</span>
          </div>
        ) : tokens.length > 0 ? (
          <div className="space-y-3">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{settings?.token_symbol || 'MSRA'}</p>
                    <p className="text-xs text-muted-foreground">{settings?.token_name || 'MsRa DevNet Token'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(token.status)}
                      <span className="text-xs text-muted-foreground">
                        {getStatusText(token.status)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold">{token.token_amount}</p>
                    <Badge variant="outline" className="text-xs">
                      {settings?.token_symbol || 'MSRA'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      من {token.points_amount} نقطة
                    </p>
                  </div>
                  
                  <div className="flex gap-1">
                    {token.token_mint_address && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyAddress(token.token_mint_address)}
                          className="h-8 w-8 p-0"
                          title="نسخ عنوان العملة"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openSolscan(token.token_mint_address, 'token')}
                          className="h-8 w-8 p-0"
                          title="عرض في Solscan"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    {token.transaction_signature && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openSolscan(token.transaction_signature, 'tx')}
                        className="h-8 w-8 p-0"
                        title="عرض المعاملة"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm mb-2">لا توجد عملات محولة</p>
            <p className="text-xs">قم بتحويل بعض النقاط إلى عملات أولاً</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};