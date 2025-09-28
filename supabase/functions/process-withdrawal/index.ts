import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from 'https://esm.sh/@solana/web3.js@1.98.4'
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, TOKEN_PROGRAM_ID } from 'https://esm.sh/@solana/spl-token@0.4.13'
// Import Buffer for Deno environment
import { Buffer } from 'https://deno.land/std@0.190.0/node/buffer.ts'

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { internal_token_symbol, internal_amount, target_token, target_address }: WithdrawalRequest = await req.json()

    // Validate input
    if (!internal_token_symbol || !internal_amount || internal_amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token or amount' }),
        { status: 400, headers: corsHeaders }
      )
    }

    if (!target_token || !target_address) {
      return new Response(
        JSON.stringify({ success: false, error: 'Target token and address required' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: corsHeaders }
      )
    }

    // Extract and verify JWT
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: corsHeaders }
      )
    }

    // Get user's internal token balance
    const { data: tokenBalance, error: balanceError } = await supabase
      .from('internal_wallet_balances')
      .select(`
        balance,
        internal_tokens (
          symbol,
          exchange_rate_usd,
          decimals
        )
      `)
      .eq('user_id', user.id)
      .eq('internal_tokens.symbol', internal_token_symbol)
      .single()

    if (balanceError || !tokenBalance) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token balance not found' }),
        { status: 404, headers: corsHeaders }
      )
    }

    if (tokenBalance.balance < internal_amount) {
      return new Response(
        JSON.stringify({ success: false, error: 'Insufficient balance' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Calculate target amount based on exchange rates
    let targetAmount = 0
    let conversionRate = 0

    if (target_token === 'SOL') {
      // Convert to SOL using USD rates
      const solPrice = 100 // Approximate SOL price in USD - should be fetched from API
      const internalTokenUsdValue = internal_amount * tokenBalance.internal_tokens.exchange_rate_usd
      targetAmount = internalTokenUsdValue / solPrice
      conversionRate = targetAmount / internal_amount
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Target token not supported yet' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Create withdrawal request record
    const { data: withdrawalRequest, error: requestError } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: user.id,
        internal_token_id: tokenBalance.token_id,
        internal_amount: internal_amount,
        target_token: target_token,
        target_address: target_address,
        target_amount: targetAmount,
        status: 'pending'
      })
      .select()
      .single()

    if (requestError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create withdrawal request' }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Process blockchain transaction for SOL
    if (target_token === 'SOL') {
      try {
        // Initialize Solana connection
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed')

        // Get hot wallet from environment
        const hotWalletKey = Deno.env.get('HOT_WALLET_PRIVATE_KEY')
        if (!hotWalletKey) {
          throw new Error('Hot wallet private key not configured')
        }

        let hotWallet: Keypair
        try {
          // Try parsing as JSON array first
          const keyArray = JSON.parse(hotWalletKey)
          hotWallet = Keypair.fromSecretKey(new Uint8Array(keyArray))
        } catch (parseError) {
          // If JSON parsing fails, try base64 format
          try {
            hotWallet = Keypair.fromSecretKey(Buffer.from(hotWalletKey, 'base64'))
          } catch (base64Error) {
            throw new Error('Invalid private key format. Please provide as JSON array or base64 string')
          }
        }

        // Check hot wallet balance
        const hotWalletBalance = await connection.getBalance(hotWallet.publicKey)
        const requiredLamports = targetAmount * LAMPORTS_PER_SOL
        
        if (hotWalletBalance < requiredLamports) {
          throw new Error('Insufficient hot wallet balance')
        }

        // Create transfer transaction
        const targetPublicKey = new PublicKey(target_address)
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: hotWallet.publicKey,
            toPubkey: targetPublicKey,
            lamports: requiredLamports,
          })
        )

        // Send transaction
        const signature = await sendAndConfirmTransaction(
          connection,
          transaction,
          [hotWallet]
        )

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
          .eq('token_id', tokenBalance.token_id)

        console.log(`Withdrawal processed: ${signature}`)

        return new Response(
          JSON.stringify({ 
            success: true, 
            transaction_hash: signature,
            target_amount: targetAmount,
            withdrawal_id: withdrawalRequest.id
          }),
          { 
            status: 200, 
            headers: corsHeaders 
          }
        )

      } catch (blockchainError) {
        console.error('Blockchain error:', blockchainError)
        
        // Update withdrawal request status to failed
        await supabase
          .from('withdrawal_requests')
          .update({
            status: 'failed'
          })
          .eq('id', withdrawalRequest.id)

        throw new Error(`Blockchain transaction failed: ${blockchainError instanceof Error ? blockchainError.message : 'Unknown blockchain error'}`)
      }
    } else {
      // For other tokens, just create pending request for manual processing
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Withdrawal request created and pending manual processing',
          withdrawal_id: withdrawalRequest.id,
          target_amount: targetAmount
        }),
        { 
          status: 200, 
          headers: corsHeaders 
        }
      )
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process withdrawal'
      }),
      { 
        status: 500, 
        headers: corsHeaders 
      }
    )
  }
})