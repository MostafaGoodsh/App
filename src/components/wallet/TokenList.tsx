import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import { ConnectedWallet } from "@/hooks/useWalletConnect";
import { ethers } from "ethers";

interface Token {
  symbol: string;
  name: string;
  balance: string;
  address: string;
  decimals: number;
}

interface TokenListProps {
  wallet: ConnectedWallet;
  onAddToken: () => void;
  customTokens?: Token[];
  onTokenAdded?: (token: Token) => void;
}

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

// Popular tokens by network
const POPULAR_TOKENS: Record<string, Array<{address: string; symbol: string; name: string}>> = {
  Ethereum: [
    { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", name: "Tether USD" },
    { address: "0xA0b86a33E6417c1ba8fD8DEEE3f1b4d9D93fb074", symbol: "USDC", name: "USD Coin" },
    { address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", symbol: "AAVE", name: "Aave" },
  ],
  Polygon: [
    { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", symbol: "USDT", name: "Tether USD" },
    { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", symbol: "USDC", name: "USD Coin" },
    { address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", symbol: "WMATIC", name: "Wrapped Matic" },
  ],
  BSC: [
    { address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT", name: "Tether USD" },
    { address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", symbol: "BUSD", name: "Binance USD" },
    { address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", symbol: "WBNB", name: "Wrapped BNB" },
  ],
  Arbitrum: [
    { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", symbol: "USDT", name: "Tether USD" },
    { address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", symbol: "USDC", name: "USD Coin" },
    { address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", symbol: "WETH", name: "Wrapped Ether" },
  ]
};

export const TokenList = ({ wallet, onAddToken, customTokens = [], onTokenAdded }: TokenListProps) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getTokenBalance = async (tokenAddress: string) => {
    try {
      if (!wallet.provider) return null;
      
      const ethersProvider = new ethers.BrowserProvider(wallet.provider);
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, ethersProvider);
      
      const [balance, name, symbol, decimals] = await Promise.all([
        contract.balanceOf(wallet.address),
        contract.name(),
        contract.symbol(),
        contract.decimals()
      ]);
      
      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      return {
        symbol,
        name,
        balance: formattedBalance,
        address: tokenAddress,
        decimals
      };
    } catch (error) {
      console.error(`Error getting balance for token ${tokenAddress}:`, error);
      return null;
    }
  };

  const loadTokenBalances = async () => {
    setIsLoading(true);
    try {
      const popularTokens = POPULAR_TOKENS[wallet.network] || [];
      const allTokenAddresses = [
        ...popularTokens.map(t => t.address),
        ...customTokens.map(t => t.address)
      ];
      
      const tokenPromises = allTokenAddresses.map(address => getTokenBalance(address));
      const results = await Promise.all(tokenPromises);
      
      const validTokens = results.filter(token => token !== null) as Token[];
      setTokens(validTokens);
    } catch (error) {
      console.error('Error loading token balances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (wallet && wallet.provider) {
      loadTokenBalances();
    }
  }, [wallet.network, wallet.address, customTokens]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="arabic-text">الرموز المميزة</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadTokenBalances}
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddToken}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="arabic-text">إضافة رمز</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Native Currency Balance */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div>
              <h4 className="font-medium">{wallet.network} Native</h4>
              <p className="text-sm text-muted-foreground">{wallet.currency}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{parseFloat(wallet.balance).toFixed(4)} {wallet.currency}</p>
            </div>
          </div>
          
          {/* Token Balances */}
          {tokens.map((token) => (
            <div key={token.address} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{token.name}</h4>
                <p className="text-sm text-muted-foreground">{token.symbol}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{parseFloat(token.balance).toFixed(4)} {token.symbol}</p>
              </div>
            </div>
          ))}
          
          {tokens.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground arabic-text">
                لم يتم العثور على رموز مميزة في هذه الشبكة
              </p>
              <Button 
                variant="outline" 
                onClick={onAddToken} 
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="arabic-text">إضافة رمز مخصص</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};