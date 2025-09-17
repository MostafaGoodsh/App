import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Copy, 
  QrCode,
  History,
  Settings,
  Shield,
  Coins,
  DollarSign,
  Activity,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface Token {
  symbol: string;
  balance: string;
  mint: string;
  decimals: number;
  usdValue?: number;
  change24h?: number;
}

interface AdvancedWalletInterfaceProps {
  publicKey: string | null;
  tokens: Token[];
  totalUsdValue: number;
  isLoadingBalance: boolean;
  onRefresh: () => void;
}

const AdvancedWalletInterface: React.FC<AdvancedWalletInterfaceProps> = ({
  publicKey,
  tokens,
  totalUsdValue = 0,
  isLoadingBalance,
  onRefresh
}) => {
  const [showBalances, setShowBalances] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ العنوان بنجاح');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!publicKey) {
    return (
      <Card className="border-2 border-orange-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <Wallet className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold">محفظة غير متصلة</h3>
            <p className="text-muted-foreground">قم بتوصيل محفظتك لعرض الأرصدة والمعاملات</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">محفظة Solana الرقمية</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span className="font-mono">{formatAddress(publicKey)}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(publicKey)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowBalances(!showBalances)}
                className="gap-2"
              >
                {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showBalances ? 'إخفاء' : 'إظهار'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onRefresh}
                disabled={isLoadingBalance}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Balance Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold">إجمالي القيمة</h3>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {showBalances ? `$${totalUsdValue.toFixed(2)}` : '****'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">قيمة تقريبية</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">عدد العملات</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">{tokens.length}</p>
              <p className="text-sm text-muted-foreground mt-1">رمز رقمي</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold">الحالة</h3>
              </div>
              <Badge variant="default" className="bg-green-500 text-white">
                متصل
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">Solana Mainnet</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Interface Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">الأرصدة</TabsTrigger>
          <TabsTrigger value="send">إرسال</TabsTrigger>
          <TabsTrigger value="receive">استقبال</TabsTrigger>
          <TabsTrigger value="history">السجل</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                العملات الرقمية
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
                      </div>
                      <div className="text-right space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : tokens.length > 0 ? (
                <div className="space-y-3">
                  {tokens.map((token, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {token.symbol.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{token.symbol}</p>
                          <p className="text-sm text-muted-foreground">
                            {token.mint.slice(0, 8)}...{token.mint.slice(-8)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {showBalances ? token.balance : '****'}
                        </p>
                        <div className="flex items-center gap-2">
                          {token.usdValue && (
                            <p className="text-sm text-muted-foreground">
                              {showBalances ? `$${token.usdValue.toFixed(2)}` : '****'}
                            </p>
                          )}
                          {token.change24h && (
                            <Badge 
                              variant={token.change24h >= 0 ? "default" : "destructive"}
                              className={token.change24h >= 0 ? "bg-green-500" : ""}
                            >
                              {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Coins className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-red-600">لم يتم العثور على أرصدة</p>
                    <p className="text-sm text-gray-600 mt-2">
                      يمكن أن يكون السبب:
                    </p>
                    <ul className="text-sm text-gray-500 mt-2 space-y-1 text-right list-disc list-inside">
                      <li>مشكلة في الاتصال بشبكة Solana</li>
                      <li>المحفظة لا تحتوي على أرصدة</li>
                      <li>خطأ في جلب البيانات من الشبكة</li>
                    </ul>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      onClick={onRefresh} 
                      variant="outline" 
                      size="sm"
                      disabled={isLoadingBalance}
                      className="gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                      {isLoadingBalance ? 'جاري المحاولة...' : 'إعادة المحاولة'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5" />
                إرسال عملات رقمية
              </CardTitle>
              <CardDescription>
                قم بإرسال العملات الرقمية إلى محفظة أخرى
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <ArrowUpRight className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                  <p className="text-lg font-medium">قريباً</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ميزة الإرسال ستكون متاحة قريباً
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5" />
                استقبال عملات رقمية
              </CardTitle>
              <CardDescription>
                مشاركة عنوان محفظتك لاستقبال العملات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-4">
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                  <QrCode className="w-16 h-16 text-gray-400" />
                  <div className="absolute text-xs">QR Code</div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">عنوان المحفظة</p>
                  <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm break-all">
                    {publicKey}
                  </div>
                  <Button 
                    onClick={() => copyToClipboard(publicKey)} 
                    variant="outline" 
                    size="sm"
                    className="w-full gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    نسخ العنوان
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                سجل المعاملات
              </CardTitle>
              <CardDescription>
                تتبع جميع معاملاتك السابقة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <History className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium">لا توجد معاملات</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ستظهر معاملاتك هنا عند إجرائها
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800">ملاحظة أمنية</h4>
              <p className="text-sm text-amber-700 mt-1">
                تأكد دائماً من صحة العناوين قبل إرسال أي معاملات. لا تشارك مفاتيحك الخاصة مع أي شخص.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedWalletInterface;