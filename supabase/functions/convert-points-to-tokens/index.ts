import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from 'https://esm.sh/@solana/web3.js@1.95.2'
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from 'https://esm.sh/@solana/spl-token@0.4.8'

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
    console.log('Starting points to tokens conversion...')
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid token or user not found')
    }

    console.log('Authenticated user:', user.id)

    const { points_amount, user_wallet_address }: ConversionRequest = await req.json()

    if (!points_amount || points_amount <= 0) {
      throw new Error('Invalid points amount')
    }

    if (!user_wallet_address) {
      throw new Error('Wallet address is required')
    }

    console.log('Conversion request:', { points_amount, user_wallet_address })

    // Get conversion settings
    const { data: settings, error: settingsError } = await supabase
      .from('conversion_settings')
      .select('*')
      .eq('is_active', true)
      .single()

    if (settingsError || !settings) {
      throw new Error('Conversion settings not found')
    }

    console.log('Conversion settings:', settings)

    // Validate conversion limits
    if (points_amount < settings.minimum_conversion_points) {
      throw new Error(`Minimum conversion is ${settings.minimum_conversion_points} points`)
    }

    if (points_amount > settings.maximum_conversion_points) {
      throw new Error(`Maximum conversion is ${settings.maximum_conversion_points} points`)
    }

    // Check daily limit
    const today = new Date().toISOString().split('T')[0]
    const { data: todayConversions, error: dailyError } = await supabase
      .from('point_to_token_conversions')
      .select('points_amount')
      .eq('user_id', user.id)
      .gte('created_at', today)
      .eq('status', 'completed')

    if (dailyError) {
      console.error('Error checking daily limit:', dailyError)
    }

    const todayTotal = todayConversions?.reduce((sum, conv) => sum + conv.points_amount, 0) || 0
    if (todayTotal + points_amount > settings.daily_conversion_limit) {
      throw new Error(`Daily conversion limit exceeded. Limit: ${settings.daily_conversion_limit}, Used: ${todayTotal}`)
    }

    // Check user's available points
    const { data: pointsBalance, error: pointsError } = await supabase
      .rpc('update_user_points_balance', { p_user_id: user.id })

    if (pointsError) {
      console.error('Error getting points balance:', pointsError)
      throw new Error('Failed to get points balance')
    }

    console.log('User points balance:', pointsBalance)

    if (pointsBalance.available_points < points_amount) {
      throw new Error(`Insufficient points. Available: ${pointsBalance.available_points}, Required: ${points_amount}`)
    }

    // Calculate token amount
    const token_amount = points_amount / settings.points_to_token_rate

    console.log('Token amount to mint:', token_amount)

    // Create conversion record
    const { data: conversion, error: conversionError } = await supabase
      .from('point_to_token_conversions')
      .insert({
        user_id: user.id,
        points_amount,
        token_amount,
        conversion_rate: settings.points_to_token_rate,
        status: 'processing'
      })
      .select()
      .single()

    if (conversionError) {
      console.error('Error creating conversion record:', conversionError)
      throw new Error('Failed to create conversion record')
    }

    console.log('Created conversion record:', conversion.id)

    // Connect to Solana Devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
    
    // For demo purposes, we'll use a keypair for the mint authority
    // In production, this should be securely managed
    const mintAuthority = Keypair.generate()
    
    console.log('Generated mint authority:', mintAuthority.publicKey.toString())

    // Airdrop SOL to mint authority for transaction fees
    try {
      const airdropSig = await connection.requestAirdrop(mintAuthority.publicKey, 0.1 * LAMPORTS_PER_SOL)
      await connection.confirmTransaction(airdropSig, 'confirmed')
      console.log('Airdrop completed for mint authority')
    } catch (airdropError) {
      console.error('Airdrop failed:', airdropError)
      // Continue anyway, might have enough SOL already
    }

    // Create or get token mint
    let tokenMint: PublicKey
    
    try {
      // For demo, create a new mint each time
      // In production, you'd want to reuse the same mint
      tokenMint = await createMint(
        connection,
        mintAuthority,
        mintAuthority.publicKey,
        null,
        settings.token_decimals || 9
      )
      
      console.log('Created token mint:', tokenMint.toString())
    } catch (mintError) {
      console.error('Error creating mint:', mintError)
      throw new Error('Failed to create token mint')
    }

    // Get user's wallet public key
    const userWalletPubkey = new PublicKey(user_wallet_address)
    
    // Get or create user's token account
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      mintAuthority,
      tokenMint,
      userWalletPubkey
    )

    console.log('User token account:', userTokenAccount.address.toString())

    // Mint tokens to user
    const mintAmount = token_amount * Math.pow(10, settings.token_decimals || 9)
    
    const mintTx = await mintTo(
      connection,
      mintAuthority,
      tokenMint,
      userTokenAccount.address,
      mintAuthority.publicKey,
      mintAmount
    )

    console.log('Minted tokens, transaction signature:', mintTx)

    // Update conversion record as completed
    const { error: updateError } = await supabase
      .from('point_to_token_conversions')
      .update({
        status: 'completed',
        token_mint_address: tokenMint.toString(),
        transaction_signature: mintTx,
        completed_at: new Date().toISOString()
      })
      .eq('id', conversion.id)

    if (updateError) {
      console.error('Error updating conversion record:', updateError)
      // Don't throw here as the tokens were already minted
    }

    // Update user points balance
    await supabase.rpc('update_user_points_balance', { p_user_id: user.id })

    console.log('Conversion completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Points converted to tokens successfully',
        data: {
          conversion_id: conversion.id,
          points_converted: points_amount,
          tokens_received: token_amount,
          token_mint: tokenMint.toString(),
          transaction_signature: mintTx,
          token_account: userTokenAccount.address.toString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Conversion error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to convert points to tokens'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})