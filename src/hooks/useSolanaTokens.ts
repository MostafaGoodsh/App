import { useState, useCallback } from 'react';
import React from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SolanaToken {
  mintAddress: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  logoUri?: string;
  isConverted?: boolean; // Flag for converted tokens
  conversionId?: string; // Reference to conversion record
}

export const useSolanaTokens = () => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<SolanaToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  // Fetch converted tokens from database
  const fetchConvertedTokens = useCallback(async () => {
    if (!user) return [];
    
    try {
      // Get conversion settings for token info
      const { data: settingsData } = await supabase
        .from('conversion_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      // Get user's completed conversions with valid mint addresses
      const { data: conversions, error } = await supabase
        .from('point_to_token_conversions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .not('token_mint_address', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const convertedTokens: SolanaToken[] = (conversions || [])
        .filter(conversion => conversion.token_mint_address && conversion.token_mint_address !== 'converted-token')
        .map(conversion => ({
          mintAddress: conversion.token_mint_address,
          symbol: settingsData?.token_symbol || 'MSRA',
          name: settingsData?.token_name || 'MsRa DevNet Token',
          balance: conversion.token_amount.toString(),
          decimals: settingsData?.token_decimals || 9,
          isConverted: true,
          conversionId: conversion.id
        }));

      console.log('Fetched converted tokens:', convertedTokens);
      return convertedTokens;
    } catch (error) {
      console.error('Error fetching converted tokens:', error);
      return [];
    }
  }, [user]);

  const fetchTokenAccounts = useCallback(async (walletAddress: string) => {
    setIsLoading(true);
    try {
      const publicKey = new PublicKey(walletAddress);
      
      // First, always fetch converted tokens
      const convertedTokens = await fetchConvertedTokens();
      console.log('Fetched converted tokens:', convertedTokens);
      
      // Try to get token accounts for this wallet
      let tokenList: SolanaToken[] = [];
      
      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_PROGRAM_ID }
        );

        // Process regular SPL tokens
        for (const tokenAccount of tokenAccounts.value) {
          const tokenInfo = tokenAccount.account.data.parsed.info;
          const mintAddress = tokenInfo.mint;
          const balance = tokenInfo.tokenAmount.uiAmount || 0;
          
          try {
            const tokenMetadata = await fetchTokenMetadata(mintAddress);
            
            tokenList.push({
              mintAddress,
              symbol: tokenMetadata?.symbol || 'Unknown',
              name: tokenMetadata?.name || 'Unknown Token',
              balance: balance.toString(),
              decimals: tokenInfo.tokenAmount.decimals,
              logoUri: tokenMetadata?.logoUri,
              isConverted: false
            });
          } catch (error) {
            console.error('Error fetching token metadata:', error);
            tokenList.push({
              mintAddress,
              symbol: `${mintAddress.slice(0, 4)}...${mintAddress.slice(-4)}`,
              name: 'Unknown Token',
              balance: balance.toString(),
              decimals: tokenInfo.tokenAmount.decimals,
              isConverted: false
            });
          }
        }
      } catch (error) {
        console.warn('Could not fetch token accounts (wallet may not have any tokens):', error.message);
        // This is normal for new wallets, continue with converted tokens only
      }
      
      // Merge with converted tokens (avoid duplicates)
      const allTokens = [...tokenList];
      
      // Add converted tokens that don't already exist in the token list
      convertedTokens.forEach(convertedToken => {
        const exists = tokenList.find(t => t.mintAddress === convertedToken.mintAddress);
        if (!exists) {
          allTokens.push(convertedToken);
        }
      });
      
      console.log('Final tokens list:', allTokens);
      setTokens(allTokens);
      return allTokens;
    } catch (error) {
      console.error('Error fetching token accounts:', error);
      // Even if there's an error, try to show converted tokens
      const convertedTokens = await fetchConvertedTokens();
      setTokens(convertedTokens);
      return convertedTokens;
    } finally {
      setIsLoading(false);
    }
  }, [connection, fetchConvertedTokens]);

  const addCustomToken = useCallback(async (mintAddress: string, walletAddress: string) => {
    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const publicKey = new PublicKey(walletAddress);
      
      // Try to get token metadata first
      const tokenMetadata = await fetchTokenMetadata(mintAddress);
      
      let balance = 0;
      let decimals = tokenMetadata?.decimals || 9;

      // Try to get token account for this specific mint
      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { mint: mintPublicKey }
        );

        if (tokenAccounts.value.length > 0) {
          const tokenInfo = tokenAccounts.value[0].account.data.parsed.info;
          balance = tokenInfo.tokenAmount.uiAmount || 0;
          decimals = tokenInfo.tokenAmount.decimals;
        }
      } catch (err) {
        console.warn('No token account found, adding with 0 balance:', err);
      }

      const newToken: SolanaToken = {
        mintAddress,
        symbol: tokenMetadata?.symbol || 'Custom',
        name: tokenMetadata?.name || 'Custom Token',
        balance: balance.toString(),
        decimals,
        logoUri: tokenMetadata?.logoUri
      };

      setTokens(prev => {
        const exists = prev.find(t => t.mintAddress === mintAddress);
        if (exists) return prev;
        return [...prev, newToken];
      });

      return newToken;
    } catch (error) {
      console.error('Error adding custom token:', error);
      throw error;
    }
  }, [connection]);

  // Listen for conversion events to auto-refresh tokens
  const handleConversionCompleted = useCallback(async (event: CustomEvent) => {
    const { walletAddress } = event.detail;
    // Refresh token accounts after a successful conversion
    if (walletAddress) {
      // Immediate refresh for converted tokens
      await fetchConvertedTokens();
      // Then full refresh after blockchain update
      setTimeout(() => {
        fetchTokenAccounts(walletAddress);
      }, 3000); // Wait 3 seconds to ensure blockchain state is updated
    }
  }, [fetchTokenAccounts, fetchConvertedTokens]);

  React.useEffect(() => {
    window.addEventListener('tokenConversionCompleted', handleConversionCompleted as EventListener);
    return () => {
      window.removeEventListener('tokenConversionCompleted', handleConversionCompleted as EventListener);
    };
  }, [handleConversionCompleted]);

  return {
    tokens,
    isLoading,
    fetchTokenAccounts,
    addCustomToken,
    fetchConvertedTokens
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