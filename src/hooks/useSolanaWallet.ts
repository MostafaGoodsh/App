import { useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useToast } from '@/hooks/use-toast';

export const useSolanaWallet = () => {
  const { connection } = useConnection();
  const { publicKey, connected, signTransaction, sendTransaction } = useWallet();
  const { toast } = useToast();

  // Get SOL balance
  const getBalance = useCallback(async () => {
    if (!publicKey || !connected) return 0;
    
    try {
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting SOL balance:', error);
      return 0;
    }
  }, [connection, publicKey, connected]);

  // Get SPL token balance
  const getTokenBalance = useCallback(async (tokenMint: string) => {
    if (!publicKey || !connected) return 0;
    
    try {
      const tokenMintPubkey = new PublicKey(tokenMint);
      const tokenAccount = await getAssociatedTokenAddress(tokenMintPubkey, publicKey);
      const balance = await connection.getTokenAccountBalance(tokenAccount);
      return parseFloat(balance.value.uiAmount?.toString() || '0');
    } catch (error) {
      console.error('Error getting token balance:', error);
      return 0;
    }
  }, [connection, publicKey, connected]);

  // Send SOL
  const sendSol = useCallback(async (toAddress: string, amount: number) => {
    if (!publicKey || !connected || !signTransaction) {
      throw new Error('المحفظة غير متصلة');
    }

    try {
      const toPubkey = new PublicKey(toAddress);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast({
        title: "تم الإرسال بنجاح",
        description: `تم إرسال ${amount} SOL إلى ${toAddress.slice(0, 8)}...`,
      });

      return signature;
    } catch (error) {
      console.error('Error sending SOL:', error);
      toast({
        title: "خطأ في الإرسال",
        description: "فشل في إرسال SOL",
        variant: "destructive"
      });
      throw error;
    }
  }, [publicKey, connected, signTransaction, sendTransaction, connection, toast]);

  // Send SPL Token
  const sendToken = useCallback(async (toAddress: string, tokenMint: string, amount: number, decimals: number = 9) => {
    if (!publicKey || !connected || !signTransaction) {
      throw new Error('المحفظة غير متصلة');
    }

    try {
      const toPubkey = new PublicKey(toAddress);
      const tokenMintPubkey = new PublicKey(tokenMint);
      
      const fromTokenAccount = await getAssociatedTokenAddress(tokenMintPubkey, publicKey);
      const toTokenAccount = await getAssociatedTokenAddress(tokenMintPubkey, toPubkey);
      
      const transaction = new Transaction().add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          publicKey,
          amount * Math.pow(10, decimals),
          [],
          TOKEN_PROGRAM_ID
        )
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast({
        title: "تم الإرسال بنجاح",
        description: `تم إرسال ${amount} رمز إلى ${toAddress.slice(0, 8)}...`,
      });

      return signature;
    } catch (error) {
      console.error('Error sending token:', error);
      toast({
        title: "خطأ في الإرسال",
        description: "فشل في إرسال الرمز",
        variant: "destructive"
      });
      throw error;
    }
  }, [publicKey, connected, signTransaction, sendTransaction, connection, toast]);

  // Airdrop SOL (testnet only)
  const requestAirdrop = useCallback(async (amount: number = 1) => {
    if (!publicKey || !connected) {
      throw new Error('المحفظة غير متصلة');
    }

    try {
      const signature = await connection.requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast({
        title: "تم استلام الـ Airdrop",
        description: `تم إضافة ${amount} SOL إلى محفظتك`,
      });

      return signature;
    } catch (error) {
      console.error('Error requesting airdrop:', error);
      toast({
        title: "خطأ في الـ Airdrop",
        description: "فشل في طلب SOL مجاني",
        variant: "destructive"
      });
      throw error;
    }
  }, [publicKey, connected, connection, toast]);

  return {
    publicKey,
    connected,
    getBalance,
    getTokenBalance,
    sendSol,
    sendToken,
    requestAirdrop,
    connection
  };
};