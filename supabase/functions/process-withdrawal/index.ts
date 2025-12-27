import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from 'https://esm.sh/@solana/web3.js@1.98.0'
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, TOKEN_PROGRAM_ID } from 'https://esm.sh/@solana/spl-token@0.4.13'

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

    // Get user's internal token by symbol first
    const { data: token, error: tokenError } = await supabase
      .from('internal_tokens')
      .select('id, symbol, exchange_rate_usd, decimals')
      .eq('symbol', internal_token_symbol)
      .eq('is_active', true)
      .single()

    if (tokenError || !token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token not found' }),
        { status: 404, headers: corsHeaders }
      )
    }

    // Get user's internal token balance
    const { data: tokenBalance, error: balanceError } = await supabase
      .from('internal_wallet_balances')
      .select('balance, token_id')
      .eq('user_id', user.id)
      .eq('token_id', token.id)
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

    // Token price estimates in USD (should be fetched from API in production)
    const tokenPrices: Record<string, number> = {
      'SOL': 100,
      'USDC': 1,
      'BTC': 40000,
      'ETH': 2000
    }

    const targetPrice = tokenPrices[target_token]
    if (!targetPrice) {
      return new Response(
        JSON.stringify({ success: false, error: `Target token ${target_token} not supported` }),
        { status: 400, headers: corsHeaders }
      )
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
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create withdrawal request', details: requestError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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
          console.log('Parsed as JSON array, length:', keyArray.length)
          hotWallet = Keypair.fromSecretKey(new Uint8Array(keyArray))
        } catch (parseError) {
          console.log('JSON parse failed, trying base58...')
          // If JSON parsing fails, try base58 format using bs58 decoding
          try {
            // Base58 decode - Solana private keys are typically 64 bytes
            const bs58chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
            let decoded = BigInt(0)
            for (const char of hotWalletKey) {
              const index = bs58chars.indexOf(char)
              if (index === -1) throw new Error('Invalid base58 character')
              decoded = decoded * BigInt(58) + BigInt(index)
            }
            
            const bytes = []
            while (decoded > 0) {
              bytes.unshift(Number(decoded % BigInt(256)))
              decoded = decoded / BigInt(256)
            }
            
            // Pad to 64 bytes if needed
            while (bytes.length < 64) {
              bytes.unshift(0)
            }
            
            console.log('Base58 decoded, bytes length:', bytes.length)
            hotWallet = Keypair.fromSecretKey(new Uint8Array(bytes))
          } catch (base58Error) {
            console.error('Base58 decode error:', base58Error)
            throw new Error('Invalid private key format. Please provide as JSON array [1,2,3...] or base58 string')
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

        return new Response(
          JSON.stringify({ 
            success: true, 
            transaction_hash: signature,
            target_amount: targetAmount,
            withdrawal_id: withdrawalRequest.id
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )

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

        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Blockchain transaction failed: ${errorMessage}`,
            withdrawal_id: withdrawalRequest.id
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    } else {
      // For other tokens (BTC, ETH), just create pending request for manual processing
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Withdrawal request created and pending manual processing',
          withdrawal_id: withdrawalRequest.id,
          target_amount: targetAmount
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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