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

    // Paymob Flash API webhook structure
    console.log('Raw webhook payload:', JSON.stringify(payload, null, 2));

    // Extract payment intention ID from webhook
    const intentionId = payload.intention?.id || payload.id;
    const transactionStatus = payload.intention?.status || payload.status;
    const isSuccessful = transactionStatus === 'PROCESSED' || 
                        transactionStatus === 'SUCCESSFUL' || 
                        transactionStatus === 'CAPTURED';

    console.log('Processing payment webhook:', {
      intention_id: intentionId,
      status: transactionStatus,
      is_successful: isSuccessful
    });

    if (!intentionId) {
      console.error('No intention ID in webhook payload');
      return new Response(
        JSON.stringify({ error: 'Invalid webhook payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find transaction by provider_transaction_id (intention ID)
    const { data: transaction, error: txError } = await supabaseClient
      .from('payment_transactions')
      .select('*, internal_tokens(*)')
      .eq('provider_transaction_id', intentionId)
      .maybeSingle();

    if (txError) {
      console.error('Database error finding transaction:', txError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!transaction) {
      console.warn('Transaction not found for intention:', intentionId);
      return new Response(
        JSON.stringify({ success: true, message: 'Transaction not found, ignoring' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found transaction:', transaction.id, 'Current status:', transaction.status);

    // Update transaction status
    if (isSuccessful) {

      // Skip if already completed
      if (transaction.status === 'completed') {
        console.log('Transaction already completed, skipping');
        return new Response(
          JSON.stringify({ success: true, message: 'Already processed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate tokens to credit
      const tokens_to_credit = transaction.amount / transaction.internal_tokens.exchange_rate_usd;

      // Check if this is an Anubis subscription payment
      const isAnubisSubscription = transaction.internal_tokens.symbol.startsWith('ANUBIS_');
      let anubisSubscriptionType = null;
      let anubisDurationDays = null;
      
      if (isAnubisSubscription) {
        // Parse subscription details from token symbol: ANUBIS_BASIC_30D, ANUBIS_PREMIUM_90D, etc.
        const parts = transaction.internal_tokens.symbol.split('_');
        anubisSubscriptionType = parts[1]?.toLowerCase(); // 'basic', 'premium', 'lifetime'
        const durationStr = parts[2]; // '30D', '90D', etc.
        anubisDurationDays = parseInt(durationStr?.replace('D', '')) || 30;
        
        console.log('Anubis subscription detected:', {
          type: anubisSubscriptionType,
          duration: anubisDurationDays
        });
      }

      // Update transaction as completed
      const { error: updateError } = await supabaseClient
        .from('payment_transactions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          tokens_credited: tokens_to_credit,
          provider_response: payload
        })
        .eq('id', transaction.id);

      if (updateError) {
        console.error('Failed to update transaction:', updateError);
        throw updateError;
      }

      // Activate Anubis subscription if applicable
      if (isAnubisSubscription && anubisSubscriptionType && anubisDurationDays) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + anubisDurationDays);
        
        const { error: activationError } = await supabaseClient
          .from('profiles')
          .update({
            has_anubis_access: true,
            anubis_subscription_type: anubisSubscriptionType,
            anubis_expires_at: expiresAt.toISOString()
          })
          .eq('user_id', transaction.user_id);

        if (activationError) {
          console.error('Failed to activate Anubis subscription:', activationError);
        } else {
          console.log('✅ Anubis subscription activated:', {
            user_id: transaction.user_id,
            type: anubisSubscriptionType,
            expires_at: expiresAt.toISOString()
          });
          
          // Send notification
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: transaction.user_id,
              title: '✅ تم تفعيل اشتراك الخزانة الرقمية',
              message: `تم تفعيل اشتراكك ${anubisSubscriptionType === 'premium' ? 'البريميوم 👑' : anubisSubscriptionType === 'lifetime' ? 'مدى الحياة ♾️' : 'الأساسي'} بنجاح`,
              type: 'subscription_activated',
              is_read: false,
              action_url: '/anubis'
            });
        }
      } else {
        // Credit user's internal wallet for regular tokens
        // First, check if balance exists
        const { data: existingBalance } = await supabaseClient
          .from('internal_wallet_balances')
          .select('balance')
          .eq('user_id', transaction.user_id)
          .eq('token_id', transaction.internal_token_id)
          .maybeSingle();

        if (existingBalance) {
          // Update existing balance
          const { error: balanceError } = await supabaseClient
            .from('internal_wallet_balances')
            .update({
              balance: existingBalance.balance + tokens_to_credit,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', transaction.user_id)
            .eq('token_id', transaction.internal_token_id);

          if (balanceError) {
            console.error('Failed to update balance:', balanceError);
          }
        } else {
          // Create new balance
          const { error: balanceError } = await supabaseClient
            .from('internal_wallet_balances')
            .insert({
              user_id: transaction.user_id,
              token_id: transaction.internal_token_id,
              balance: tokens_to_credit
            });

          if (balanceError) {
            console.error('Failed to create balance:', balanceError);
          }
        }
      }

      console.log('✅ Payment completed successfully via webhook:', {
        transaction_id: transaction.id,
        intention_id: intentionId,
        tokens_credited: isAnubisSubscription ? 0 : tokens_to_credit,
        is_anubis_subscription: isAnubisSubscription,
        user_id: transaction.user_id
      });
    } else {
      // Payment failed or pending
      const isFailed = transactionStatus === 'FAILED' || 
                      transactionStatus === 'EXPIRED' || 
                      transactionStatus === 'DECLINED';

      if (isFailed) {
        await supabaseClient
          .from('payment_transactions')
          .update({
            status: 'failed',
            failed_at: new Date().toISOString(),
            notes: `Payment ${transactionStatus.toLowerCase()}`,
            provider_response: payload
          })
          .eq('id', transaction.id);

        console.log('❌ Payment failed via webhook:', {
          transaction_id: transaction.id,
          status: transactionStatus
        });
      } else {
        console.log('⏳ Payment still pending:', {
          transaction_id: transaction.id,
          status: transactionStatus
        });
      }
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
