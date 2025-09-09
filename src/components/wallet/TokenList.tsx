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
}

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

export const TokenList = ({ wallet, onAddToken }: TokenListProps) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Default popular tokens on Ethereum
  const defaultTokens = [
    { address: "0xA0b86a33E6417c1ba8fD8DEEE3f1b4d9D93fb074", symbol: "USDT", name: "Tether USD" },
    { address: "0xa0b73E1Ff0B80914AB6fe0444E65848C4C34450b", symbol: "USDC", name: "USD Coin" },
    { address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", symbol: "AAVE", name: "Aave" },
  ];

  const getTokenBalance = async (tokenAddress: string) => {
    try {
      if (!wallet.provider) return "0";
      
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
      const tokenPromises = defaultTokens.map(token => getTokenBalance(token.address));
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
  }, [wallet]);

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
              <Plus className="h-4 w-4" />
              <span className="arabic-text">إضافة رمز</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* ETH Balance */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Ethereum</h4>
              <p className="text-sm text-muted-foreground">ETH</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{wallet.balance} ETH</p>
            </div>
          </div>
          
          {/* Token Balances */}
          {tokens.map((token) => (
            <div key={token.address} className="flex items-center justify-between p-3 border rounded-lg">
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
            <p className="text-center text-muted-foreground arabic-text">
              لم يتم العثور على رموز مميزة
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};