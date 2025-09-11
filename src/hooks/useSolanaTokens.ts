import { useState, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

export interface SolanaToken {
  mintAddress: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  logoUri?: string;
}

export const useSolanaTokens = () => {
  const [tokens, setTokens] = useState<SolanaToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  const fetchTokenAccounts = useCallback(async (walletAddress: string) => {
    setIsLoading(true);
    try {
      const publicKey = new PublicKey(walletAddress);
      
      // Get all token accounts for this wallet
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      const tokenList: SolanaToken[] = [];

      for (const tokenAccount of tokenAccounts.value) {
        const tokenInfo = tokenAccount.account.data.parsed.info;
        const mintAddress = tokenInfo.mint;
        const balance = tokenInfo.tokenAmount.uiAmount || 0;
        
        // Only include tokens with balance > 0
        if (balance > 0) {
          try {
            // Try to get token metadata from popular token list
            const tokenMetadata = await fetchTokenMetadata(mintAddress);
            
            tokenList.push({
              mintAddress,
              symbol: tokenMetadata?.symbol || 'Unknown',
              name: tokenMetadata?.name || 'Unknown Token',
              balance: balance.toString(),
              decimals: tokenInfo.tokenAmount.decimals,
              logoUri: tokenMetadata?.logoUri
            });
          } catch (error) {
            console.error('Error fetching token metadata:', error);
            // Add token without metadata
            tokenList.push({
              mintAddress,
              symbol: `${mintAddress.slice(0, 4)}...${mintAddress.slice(-4)}`,
              name: 'Unknown Token',
              balance: balance.toString(),
              decimals: tokenInfo.tokenAmount.decimals
            });
          }
        }
      }

      setTokens(tokenList);
      return tokenList;
    } catch (error) {
      console.error('Error fetching token accounts:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [connection]);

  const addCustomToken = useCallback(async (mintAddress: string, walletAddress: string) => {
    try {
      const publicKey = new PublicKey(walletAddress);
      const mintPublicKey = new PublicKey(mintAddress);
      
      // Get token account for this specific mint
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint: mintPublicKey }
      );

      if (tokenAccounts.value.length > 0) {
        const tokenInfo = tokenAccounts.value[0].account.data.parsed.info;
        const balance = tokenInfo.tokenAmount.uiAmount || 0;
        
        const tokenMetadata = await fetchTokenMetadata(mintAddress);
        
        const newToken: SolanaToken = {
          mintAddress,
          symbol: tokenMetadata?.symbol || 'Custom',
          name: tokenMetadata?.name || 'Custom Token',
          balance: balance.toString(),
          decimals: tokenInfo.tokenAmount.decimals,
          logoUri: tokenMetadata?.logoUri
        };

        setTokens(prev => {
          const exists = prev.find(t => t.mintAddress === mintAddress);
          if (exists) return prev;
          return [...prev, newToken];
        });

        return newToken;
      } else {
        throw new Error('لا يوجد رصيد من هذه العملة في المحفظة');
      }
    } catch (error) {
      console.error('Error adding custom token:', error);
      throw error;
    }
  }, [connection]);

  return {
    tokens,
    isLoading,
    fetchTokenAccounts,
    addCustomToken
  };
};

// Helper function to fetch token metadata from Solana token list
async function fetchTokenMetadata(mintAddress: string) {
  try {
    // Use Jupiter token list API
    const response = await fetch(`https://token.jup.ag/strict`);
    const tokenList = await response.json();
    
    const token = tokenList.find((t: any) => t.address === mintAddress);
    return token ? {
      symbol: token.symbol,
      name: token.name,
      logoUri: token.logoURI
    } : null;
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return null;
  }
}