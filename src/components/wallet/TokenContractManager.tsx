import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  FileText, Plus, Trash2, Loader2, CheckCircle2, 
  ExternalLink, Copy, AlertTriangle, Search, Pencil
} from 'lucide-react';
import { PublicKey } from '@solana/web3.js';
import { getAddress, isAddress } from 'ethers';

interface TokenContract {
  id: string;
  contract_address: string;
  name: string;
  symbol: string;
  decimals: number;
  network: string;
  logo_url?: string;
  is_verified: boolean;
}

interface TokenContractManagerProps {
  network?: 'solana-devnet' | 'solana-mainnet' | 'solana' | 'ethereum' | 'bsc' | 'polygon';
  onTokenAdded?: (token: TokenContract) => void;
}

const normalizeSolanaNetwork = (network: TokenContractManagerProps['network']) =>
  network === 'solana' ? 'solana-mainnet' : network;

export const TokenContractManager = ({ 
  network = 'solana-devnet',
  onTokenAdded 
}: TokenContractManagerProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [contractAddress, setContractAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState<Partial<TokenContract> | null>(null);
  const [savedTokens, setSavedTokens] = useState<TokenContract[]>([]);
  const [editingToken, setEditingToken] = useState<TokenContract | null>(null);
  const [editForm, setEditForm] = useState({ name: '', symbol: '' });
  const isSolanaNetwork = network.startsWith('solana');

  // Load saved tokens
  const loadSavedTokens = async () => {
    try {
      let query = supabase.from('custom_tokens').select('*');
      query = network === 'solana-mainnet' || network === 'solana'
        ? query.in('network', ['solana-mainnet', 'solana'])
        : query.eq('network', network);
      const { data, error } = await query;

      if (!error && data) {
        setSavedTokens(data as TokenContract[]);
      }
    } catch (err) {
      console.error('Error loading tokens:', err);
    }
  };

  useEffect(() => {
    loadSavedTokens();
    setVerifiedToken(null);
    setContractAddress('');
  }, [network]);

  // Verify token contract
  const verifyContract = async () => {
    if (!contractAddress.trim()) {
      toast({
        title: "خطأ | Error",
        description: "الرجاء إدخال عنوان العقد",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      if (isSolanaNetwork) {
        const normalizedAddress = new PublicKey(contractAddress.trim()).toBase58();
        if (network === 'solana-mainnet') {
          const response = await fetch(`https://tokens.jup.ag/token/${normalizedAddress}`);
          if (response.ok) {
            const token = await response.json();
            if (token?.address) {
              setVerifiedToken({ contract_address: token.address, name: token.name, symbol: token.symbol, decimals: token.decimals, logo_url: token.logoURI, network, is_verified: true });
              return;
            }
          }
        }

        setVerifiedToken({ contract_address: normalizedAddress, name: network === 'solana-devnet' ? 'Solana Devnet Token' : 'Unknown Solana Token', symbol: 'SPL', decimals: 9, network, is_verified: false });
        toast({ title: network === 'solana-devnet' ? 'تم قبول عنوان الـ Mint' : 'تحذير | Warning', description: network === 'solana-devnet' ? 'يمكن حفظ العقد مباشرة على Devnet.' : 'لم يتم العثور على بيانات موثقة لكن يمكن حفظ العقد يدوياً.' });
      } else {
        if (!isAddress(contractAddress.trim())) throw new Error('عنوان العقد غير صالح');
        const normalizedAddress = getAddress(contractAddress.trim());
        setVerifiedToken({ contract_address: normalizedAddress, name: 'EVM Token', symbol: 'ERC20', decimals: 18, network, is_verified: false });
        toast({ title: 'تم قبول العقد', description: 'تم التحقق من صيغة العنوان ويمكن حفظه الآن.' });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "خطأ في التحقق",
        description: "فشل في التحقق من عنوان العقد",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Add token to database
  const addToken = async () => {
    if (!verifiedToken || !user) return;

    const normalizedNetwork = normalizeSolanaNetwork(network);

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_tokens')
        .insert({
          contract_address: verifiedToken.contract_address!,
          name: verifiedToken.name!,
          symbol: verifiedToken.symbol!,
          decimals: verifiedToken.decimals || 9,
          network: normalizedNetwork,
          logo_url: verifiedToken.logo_url,
          is_verified: verifiedToken.is_verified || false
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "العملة موجودة بالفعل",
            description: "هذه العملة مضافة مسبقاً",
          });
        } else {
          throw error;
        }
      } else if (data) {
        toast({
          title: "تم إضافة العملة بنجاح",
          description: `${data.name} (${data.symbol})`,
        });
        onTokenAdded?.(data as TokenContract);
        setContractAddress('');
        setVerifiedToken(null);
        loadSavedTokens();
      }
    } catch (error) {
      console.error('Error adding token:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة العملة",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove token
  const removeToken = async (tokenId: string) => {
    try {
      const { error } = await supabase
        .from('custom_tokens')
        .delete()
        .eq('id', tokenId);

      if (!error) {
        toast({
          title: "تم الحذف",
          description: "تم حذف العملة بنجاح",
        });
        loadSavedTokens();
      }
    } catch (error) {
      console.error('Error removing token:', error);
    }
  };

  const handleAddSavedTokenToWallet = async (token: TokenContract) => {
    onTokenAdded?.(token);
    toast({
      title: 'تمت الإضافة للمحفظة',
      description: `${token.name} (${token.symbol})`,
    });
  };

  const openEditDialog = (token: TokenContract) => {
    setEditingToken(token);
    setEditForm({ name: token.name, symbol: token.symbol });
  };

  const saveEditToken = async () => {
    if (!editingToken || !editForm.name || !editForm.symbol) return;
    const { error } = await supabase
      .from('custom_tokens')
      .update({ name: editForm.name, symbol: editForm.symbol.toUpperCase() })
      .eq('id', editingToken.id);
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم التحديث' });
      setEditingToken(null);
      loadSavedTokens();
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "تم النسخ",
      description: "تم نسخ العنوان",
    });
  };

  const getExplorerUrl = (address: string) => {
    switch (network) {
      case 'solana-devnet':
        return `https://solscan.io/token/${address}?cluster=devnet`;
      case 'solana-mainnet':
      case 'solana':
        return `https://solscan.io/token/${address}`;
      case 'ethereum':
        return `https://etherscan.io/token/${address}`;
      case 'bsc':
        return `https://bscscan.com/token/${address}`;
      case 'polygon':
        return `https://polygonscan.com/token/${address}`;
      default:
        return '#';
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <div className="space-y-1">
            <span className="font-cairo" dir="rtl">إضافة عقد عملة</span>
            <span className="text-sm font-normal text-muted-foreground block font-playfair" dir="ltr">
              Add Token Contract
            </span>
          </div>
        </CardTitle>
        <CardDescription>
          أضف عقود العملات المخصصة للتتبع والتداول
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Network Badge */}
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">الشبكة:</Label>
          <Badge variant="outline" className="capitalize">
            {network}
          </Badge>
        </div>

        {/* Contract Address Input */}
        <div className="space-y-2">
          <Label htmlFor="contract">
            عنوان العقد | Contract Address
          </Label>
          <div className="flex gap-2">
            <Input
              id="contract"
              placeholder={isSolanaNetwork 
                ? "أدخل Mint Address..." 
                : "0x..."}
              value={contractAddress}
              onChange={(e) => {
                setContractAddress(e.target.value);
                setVerifiedToken(null);
              }}
              dir="ltr"
              className="font-mono text-sm"
            />
            <Button 
              onClick={verifyContract}
              disabled={isVerifying || !contractAddress.trim()}
              variant="outline"
            >
              {isVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Verified Token Info */}
        {verifiedToken && (
          <Alert className={verifiedToken.is_verified 
            ? "border-green-500/50 bg-green-500/10" 
            : "border-yellow-500/50 bg-yellow-500/10"
          }>
            <div className="flex items-start gap-3">
              {verifiedToken.logo_url ? (
                <img 
                  src={verifiedToken.logo_url} 
                  alt={verifiedToken.symbol}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{verifiedToken.name}</span>
                  <Badge variant="outline">{verifiedToken.symbol}</Badge>
                  {verifiedToken.is_verified ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  {verifiedToken.contract_address?.slice(0, 20)}...
                </p>
                <div className="flex gap-2 mt-2">
                  <Button 
                    size="sm" 
                    onClick={addToken}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin ml-1" />
                    ) : (
                      <Plus className="w-4 h-4 ml-1" />
                    )}
                    إضافة
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(getExplorerUrl(verifiedToken.contract_address!), '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 ml-1" />
                    عرض
                  </Button>
                </div>
              </div>
            </div>
          </Alert>
        )}

        {/* Saved Tokens */}
        {savedTokens.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <Label className="text-sm text-muted-foreground">
              العملات المحفوظة | Saved Tokens
            </Label>
            <div className="space-y-2">
              {savedTokens.map((token) => (
                <div 
                  key={token.id}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {token.logo_url ? (
                      <img 
                        src={token.logo_url} 
                        alt={token.symbol}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/20" />
                    )}
                    <div>
                      <span className="font-medium text-sm">{token.symbol}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {token.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handleAddSavedTokenToWallet(token)}
                      title="إضافة للمحفظة"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => copyAddress(token.contract_address)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeToken(token.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
