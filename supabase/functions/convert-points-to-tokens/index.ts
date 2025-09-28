import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from 'https://esm.sh/@solana/web3.js@1.98.0'
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from 'https://esm.sh/@solana/spl-token@0.4.13'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConversionRequest {
  points_amount: number
  user_wallet_address: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { points_amount, user_wallet_address }: ConversionRequest = await req.json()

    // Validate input
    if (!points_amount || points_amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid points amount' }),
        { status: 400, headers: corsHeaders }
      )
    }

    if (!user_wallet_address) {
      return new Response(
        JSON.stringify({ success: false, error: 'User wallet address required' }),
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

    // Get conversion settings
    const { data: settings, error: settingsError } = await supabase
      .from('conversion_settings')
      .select('*')
      .eq('is_active', true)
      .single()

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ success: false, error: 'Conversion settings not found' }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Calculate tokens to mint
    const tokensToMint = points_amount * settings.points_to_token_rate

    // Get user's current points balance
    const { data: balance, error: balanceError } = await supabase
      .from('user_points_balance')
      .select('available_points, converted_points')
      .eq('user_id', user.id)
      .single()

    if (balanceError || !balance || balance.available_points < points_amount) {
      return new Response(
        JSON.stringify({ success: false, error: 'Insufficient points balance' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Initialize Solana connection
    const connection = new Connection(
      settings.solana_rpc_url || 'https://api.devnet.solana.com',
      'confirmed'
    )

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
      // If JSON parsing fails, try base58 format
      try {
        const keyBytes = new TextEncoder().encode(hotWalletKey)
        hotWallet = Keypair.fromSecretKey(keyBytes.slice(0, 64))
      } catch (base58Error) {
        throw new Error('Invalid private key format. Please provide as JSON array or base58 string')
      }
    }

    console.log('Hot wallet public key:', hotWallet.publicKey.toString())

    // Check if hot wallet has enough SOL for operations
    const hotWalletBalance = await connection.getBalance(hotWallet.publicKey)
    const requiredSOL = 0.01 * LAMPORTS_PER_SOL // 0.01 SOL minimum
    
    if (hotWalletBalance < requiredSOL) {
      console.log('Hot wallet balance too low, requesting airdrop...')
      try {
        const signature = await connection.requestAirdrop(
          hotWallet.publicKey,
          0.1 * LAMPORTS_PER_SOL
        )
        await connection.confirmTransaction(signature)
        console.log('Airdrop successful')
      } catch (airdropError) {
        console.error('Airdrop failed:', airdropError)
        // Continue anyway, might have enough SOL already
      }
    }

    // Create token mint
    let tokenMint: PublicKey
    
    try {
      tokenMint = await createMint(
        connection,
        hotWallet,
        hotWallet.publicKey,
        null,
        settings.token_decimals || 9
      )
      
      console.log('Created token mint:', tokenMint.toString())
    } catch (mintError) {
      console.error('Error creating mint:', mintError)
      throw new Error('Failed to create token mint')
    }

    // Get or create user's token account
    let userTokenAccount
    try {
      const userPublicKey = new PublicKey(user_wallet_address)
      userTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        hotWallet,
        tokenMint,
        userPublicKey
      )
      
      console.log('User token account:', userTokenAccount.address.toString())
    } catch (accountError) {
      console.error('Error creating user token account:', accountError)
      throw new Error('Failed to create user token account')
    }

    // Mint tokens to user
    try {
      const mintSignature = await mintTo(
        connection,
        hotWallet,
        tokenMint,
        userTokenAccount.address,
        hotWallet.publicKey,
        tokensToMint * (10 ** (settings.token_decimals || 9)) // Convert to token units
      )
      
      console.log('Mint signature:', mintSignature)
    } catch (mintToError) {
      console.error('Error minting tokens:', mintToError)
      throw new Error('Failed to mint tokens')
    }

    // Record the conversion in database
    const { error: conversionError } = await supabase
      .from('point_to_token_conversions')
      .insert({
        user_id: user.id,
        points_amount: points_amount,
        tokens_amount: tokensToMint,
        conversion_rate: settings.points_to_token_rate,
        token_mint_address: tokenMint.toString(),
        user_wallet_address: user_wallet_address,
        status: 'completed',
        blockchain_tx_hash: tokenMint.toString() // Using mint address as reference
      })

    if (conversionError) {
      console.error('Error recording conversion:', conversionError)
      // Don't fail the whole operation, just log the error
    }

    // Update user's points balance
    const { error: updateError } = await supabase
      .from('user_points_balance')
      .update({
        available_points: balance.available_points - points_amount,
        converted_points: (balance.converted_points || 0) + points_amount
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating points balance:', updateError)
      // Don't fail the whole operation
    }

    console.log(`Successfully converted ${points_amount} points to ${tokensToMint} tokens for user ${user.id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        tokens_minted: tokensToMint,
        token_mint_address: tokenMint.toString(),
        user_token_account: userTokenAccount.address.toString(),
        points_converted: points_amount
      }),
      { 
        status: 200, 
        headers: corsHeaders 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to convert points to tokens'
      }),
      { 
        status: 500, 
        headers: corsHeaders 
      }
    )
  }
})