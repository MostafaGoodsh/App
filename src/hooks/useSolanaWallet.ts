import { useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from '@solana/web3.js';
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

  // Send SOL - Alternative method using signTransaction instead of sendTransaction
  const sendSol = useCallback(async (toAddress: string, amount: number) => {
    if (!publicKey || !connected || !signTransaction) {
      throw new Error('المحفظة غير متصلة');
    }

    try {
      console.log('Starting SOL transfer...', { toAddress, amount });
      
      // التحقق من الرصيد أولاً
      const balance = await connection.getBalance(publicKey);
      const balanceInSol = balance / LAMPORTS_PER_SOL;
      
      // ترك مساحة لرسوم الشبكة (0.000005 SOL)
      const networkFee = 0.000005;
      if (balanceInSol < (amount + networkFee)) {
        throw new Error(`الرصيد غير كافي. الرصيد الحالي: ${balanceInSol.toFixed(6)} SOL، مطلوب: ${(amount + networkFee).toFixed(6)} SOL`);
      }

      const toPubkey = new PublicKey(toAddress);
      console.log('Target public key:', toPubkey.toString());
      
      // إنشاء المعاملة
      const transaction = new Transaction();
      
      // الحصول على أحدث blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      console.log('Transaction setup:', { blockhash, feePayer: publicKey.toString() });
      
      // إضافة تعليمة التحويل
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey,
          lamports: Math.floor(amount * LAMPORTS_PER_SOL),
        })
      );

      console.log('Transaction instruction added, signing...');

      // توقيع المعاملة باستخدام المحفظة
      const signedTransaction = await signTransaction(transaction);
      console.log('Transaction signed, sending...');
      
      // إرسال المعاملة الموقعة
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        maxRetries: 3,
        preflightCommitment: 'confirmed',
        skipPreflight: false,
      });
      
      console.log('Transaction sent, signature:', signature);
      
      // انتظار التأكيد
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      console.log('Transaction confirmation:', confirmation);

      if (confirmation.value.err) {
        throw new Error('فشل في تأكيد المعاملة: ' + JSON.stringify(confirmation.value.err));
      }
      
      toast({
        title: "تم الإرسال بنجاح",
        description: `تم إرسال ${amount} SOL إلى ${toAddress.slice(0, 8)}...`,
      });

      return signature;
    } catch (error: any) {
      console.error('Error sending SOL:', error);
      
      let errorMessage = "فشل في إرسال SOL";
      if (error.message?.includes('insufficient funds')) {
        errorMessage = "الرصيد غير كافي لإتمام المعاملة";
      } else if (error.message?.includes('الرصيد غير كافي')) {
        errorMessage = error.message;
      } else if (error.message?.includes('Invalid public key')) {
        errorMessage = "عنوان المحفظة غير صحيح";
      } else if (error.message?.includes('User rejected')) {
        errorMessage = "تم إلغاء المعاملة من قبل المستخدم";
      } else if (error.message?.includes('Signature verification failed')) {
        errorMessage = "فشل في التحقق من التوقيع - يرجى المحاولة مرة أخرى";
      }
      
      toast({
        title: "خطأ في الإرسال",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  }, [publicKey, connected, signTransaction, connection, toast]);

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