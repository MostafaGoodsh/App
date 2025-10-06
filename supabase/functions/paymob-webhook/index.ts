import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload = await req.json();
    console.log('Paymob webhook received:', JSON.stringify(payload, null, 2));

    // Verify HMAC signature (optional - add PAYMOB_HMAC_SECRET if needed)
    const PAYMOB_HMAC = Deno.env.get('PAYMOB_HMAC_SECRET');
    if (PAYMOB_HMAC) {
      const receivedHmac = req.headers.get('x-paymob-hmac');
      const encoder = new TextEncoder();
      const keyData = encoder.encode(PAYMOB_HMAC);
      const messageData = encoder.encode(JSON.stringify(payload));
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-512' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
      const calculatedHmac = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      if (receivedHmac !== calculatedHmac) {
        console.error('Invalid HMAC signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Extract payment data
    const {
      obj: {
        id: paymob_transaction_id,
        success,
        amount_cents,
        order: { merchant_order_id }
      }
    } = payload;

    console.log('Processing payment:', {
      transaction_id: merchant_order_id,
      paymob_id: paymob_transaction_id,
      success,
      amount_cents
    });

    // Update transaction status
    if (success) {
      // Get transaction details
      const { data: transaction, error: txError } = await supabaseClient
        .from('payment_transactions')
        .select('*, internal_tokens(*)')
        .eq('id', merchant_order_id)
        .single();

      if (txError || !transaction) {
        console.error('Transaction not found:', merchant_order_id);
        return new Response(
          JSON.stringify({ error: 'Transaction not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate tokens to credit
      const tokens_to_credit = transaction.amount / transaction.internal_tokens.exchange_rate_usd;

      // Update transaction as completed
      const { error: updateError } = await supabaseClient
        .from('payment_transactions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          provider_transaction_id: paymob_transaction_id.toString(),
          tokens_credited: tokens_to_credit,
          provider_response: payload
        })
        .eq('id', merchant_order_id);

      if (updateError) {
        console.error('Failed to update transaction:', updateError);
      }

      // Credit user's internal wallet
      const { error: balanceError } = await supabaseClient
        .from('internal_wallet_balances')
        .upsert({
          user_id: transaction.user_id,
          token_id: transaction.internal_token_id,
          balance: tokens_to_credit
        }, {
          onConflict: 'user_id,token_id',
          ignoreDuplicates: false
        });

      // If balance doesn't exist, create it
      if (balanceError) {
        await supabaseClient
          .from('internal_wallet_balances')
          .insert({
            user_id: transaction.user_id,
            token_id: transaction.internal_token_id,
            balance: tokens_to_credit
          });
      } else {
        // Update existing balance
        await supabaseClient.rpc('increment_balance', {
          p_user_id: transaction.user_id,
          p_token_id: transaction.internal_token_id,
          p_amount: tokens_to_credit
        });
      }

      console.log('Payment completed successfully:', {
        transaction_id: merchant_order_id,
        tokens_credited: tokens_to_credit
      });
    } else {
      // Payment failed
      await supabaseClient
        .from('payment_transactions')
        .update({
          status: 'failed',
          failed_at: new Date().toISOString(),
          provider_response: payload
        })
        .eq('id', merchant_order_id);

      console.log('Payment failed:', merchant_order_id);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
