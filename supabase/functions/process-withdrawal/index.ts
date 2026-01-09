import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from 'https://esm.sh/@solana/web3.js@1.98.0'
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, TOKEN_PROGRAM_ID } from 'https://esm.sh/@solana/spl-token@0.4.13'
import bs58 from 'https://esm.sh/bs58@6.0.0'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WithdrawalRequest {
  internal_token_symbol: string
  internal_amount: number
  target_token: string // 'SOL', 'USDC', 'BTC', etc.
  target_address: string
}

const jsonResponse = (body: unknown, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { internal_token_symbol, internal_amount, target_token, target_address }: WithdrawalRequest = await req.json()

    // Validate input
    if (!internal_token_symbol || !internal_amount || internal_amount <= 0) {
      return jsonResponse({ success: false, error: 'Invalid token or amount' })
    }

    if (!target_token || !target_address) {
      return jsonResponse({ success: false, error: 'Target token and address required' })
    }

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ success: false, error: 'Authentication required' }, 401)
    }

    // Extract and verify JWT
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt)

    if (authError || !user) {
      return jsonResponse({ success: false, error: 'Invalid authentication' }, 401)
    }

    // Get user's internal token by symbol first
    const { data: token, error: tokenError } = await supabase
      .from('internal_tokens')
      .select('id, symbol, exchange_rate_usd, decimals')
      .eq('symbol', internal_token_symbol)
      .eq('is_active', true)
      .single()

    if (tokenError || !token) {
      return jsonResponse({ success: false, error: 'Token not found' })
    }

    // Get user's internal token balance
    const { data: tokenBalance, error: balanceError } = await supabase
      .from('internal_wallet_balances')
      .select('balance, token_id')
      .eq('user_id', user.id)
      .eq('token_id', token.id)
      .single()

    if (balanceError || !tokenBalance) {
      return jsonResponse({ success: false, error: 'Token balance not found' })
    }

    if (tokenBalance.balance < internal_amount) {
      return jsonResponse({ success: false, error: 'Insufficient balance' })
    }

    // Calculate target amount based on exchange rates
    let targetAmount = 0
    let conversionRate = 0

    // Token price estimates in USD (should be fetched from API in production)
    const tokenPrices: Record<string, number> = {
      'SOL': 100,
      'USDC': 1,
      'BTC': 40000,
      'ETH': 2000
    }

    const targetPrice = tokenPrices[target_token]
    if (!targetPrice) {
      return jsonResponse({ success: false, error: `Target token ${target_token} not supported` })
    }

    const internalTokenUsdValue = internal_amount * token.exchange_rate_usd
    targetAmount = internalTokenUsdValue / targetPrice
    conversionRate = targetAmount / internal_amount

    console.log(`Converting ${internal_amount} ${internal_token_symbol} to ${targetAmount} ${target_token}`)

    // Create withdrawal request record
    console.log('Creating withdrawal request:', {
      user_id: user.id,
      internal_token_id: token.id,
      internal_amount,
      target_token,
      target_address,
      target_amount: targetAmount
    })

    const { data: withdrawalRequest, error: requestError } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: user.id,
        internal_token_id: token.id,
        internal_amount: internal_amount,
        target_token: target_token,
        target_address: target_address,
        target_amount: targetAmount,
        status: 'pending'
      })
      .select()
      .single()

    if (requestError) {
      console.error('Withdrawal request creation error:', requestError)
      return jsonResponse({
        success: false,
        error: 'Failed to create withdrawal request',
        details: requestError.message,
      })
    }

    console.log('Withdrawal request created:', withdrawalRequest.id)

    // USDC devnet mint address
    const USDC_DEVNET_MINT = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'

    // Process blockchain transaction for SOL or USDC on Solana
    if (target_token === 'SOL' || target_token === 'USDC') {
      try {
        // Initialize Solana connection
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed')

        // Get hot wallet from environment
        const hotWalletKey = Deno.env.get('HOT_WALLET_PRIVATE_KEY')
        if (!hotWalletKey) {
          throw new Error('Hot wallet private key not configured')
        }

        console.log('Hot wallet key length:', hotWalletKey.length)
        console.log('Hot wallet key starts with:', hotWalletKey.substring(0, 10))

        let hotWallet: Keypair
        try {
          // Try parsing as JSON array first (e.g., [1,2,3,...])
          const keyArray = JSON.parse(hotWalletKey)
          if (!Array.isArray(keyArray)) {
            throw new Error('Private key JSON must be an array')
          }
          console.log('Parsed as JSON array, length:', keyArray.length)
          hotWallet = Keypair.fromSecretKey(new Uint8Array(keyArray))
        } catch (_parseError) {
          // Fallback: base58 encoded secret key (64 bytes) or seed (32 bytes)
          const decoded = bs58.decode(hotWalletKey.trim())
          console.log('Base58 decoded length:', decoded.length)

          if (decoded.length === 64) {
            hotWallet = Keypair.fromSecretKey(decoded)
          } else if (decoded.length === 32) {
            hotWallet = Keypair.fromSeed(decoded)
          } else {
            throw new Error(
              `Invalid private key length (${decoded.length}). Expected 64 (secretKey) or 32 (seed).`
            )
          }
        }
        
        console.log('Hot wallet public key:', hotWallet.publicKey.toBase58())

        const targetPublicKey = new PublicKey(target_address)
        let signature: string

        if (target_token === 'SOL') {
          // Check hot wallet balance
          const hotWalletBalance = await connection.getBalance(hotWallet.publicKey)
          const requiredLamports = Math.floor(targetAmount * LAMPORTS_PER_SOL)
          
          if (hotWalletBalance < requiredLamports) {
            throw new Error('Insufficient hot wallet SOL balance')
          }

          // Create SOL transfer transaction
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: hotWallet.publicKey,
              toPubkey: targetPublicKey,
              lamports: requiredLamports,
            })
          )

          signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [hotWallet]
          )
        } else {
          // USDC SPL token transfer
          const mintPubkey = new PublicKey(USDC_DEVNET_MINT)
          
          // Get or create associated token accounts
          const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            hotWallet,
            mintPubkey,
            hotWallet.publicKey
          )

          const toTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            hotWallet,
            mintPubkey,
            targetPublicKey
          )

          // USDC has 6 decimals
          const amount = Math.floor(targetAmount * 1_000_000)

          // Check hot wallet USDC balance
          if (Number(fromTokenAccount.amount) < amount) {
            throw new Error('Insufficient hot wallet USDC balance')
          }

          // Create SPL token transfer transaction
          const transaction = new Transaction().add(
            createTransferInstruction(
              fromTokenAccount.address,
              toTokenAccount.address,
              hotWallet.publicKey,
              amount,
              [],
              TOKEN_PROGRAM_ID
            )
          )

          signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [hotWallet]
          )
        }

        // Update withdrawal request with transaction hash
        await supabase
          .from('withdrawal_requests')
          .update({
            status: 'completed',
            transaction_hash: signature,
            processed_at: new Date().toISOString()
          })
          .eq('id', withdrawalRequest.id)

        // Update user's internal token balance
        await supabase
          .from('internal_wallet_balances')
          .update({
            balance: tokenBalance.balance - internal_amount
          })
          .eq('user_id', user.id)
          .eq('token_id', token.id)

        console.log(`Withdrawal processed: ${signature}`)

        return jsonResponse({
          success: true,
          transaction_hash: signature,
          target_amount: targetAmount,
          withdrawal_id: withdrawalRequest.id,
        })

      } catch (blockchainError) {
        const errorMessage = blockchainError instanceof Error ? blockchainError.message : 'Unknown blockchain error'
        console.error('Blockchain error details:', {
          error: errorMessage,
          stack: blockchainError instanceof Error ? blockchainError.stack : undefined,
          target_token,
          target_address,
          target_amount: targetAmount
        })
        
        // Update withdrawal request status to failed
        await supabase
          .from('withdrawal_requests')
          .update({
            status: 'failed'
          })
          .eq('id', withdrawalRequest.id)

        return jsonResponse({
          success: false,
          error: `Blockchain transaction failed: ${errorMessage}`,
          withdrawal_id: withdrawalRequest.id,
        })
      }
    } else {
      // For other tokens (BTC, ETH), just create pending request for manual processing
      return jsonResponse({
        success: true,
        message: 'Withdrawal request created and pending manual processing',
        withdrawal_id: withdrawalRequest.id,
        target_amount: targetAmount,
      })
    }

  } catch (error) {
    console.error('Function error:', error)
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process withdrawal',
    })
  }
})