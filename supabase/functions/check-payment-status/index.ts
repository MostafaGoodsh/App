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

    // Authenticate user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { transaction_id } = await req.json();

    if (!transaction_id) {
      return new Response(
        JSON.stringify({ error: 'Transaction ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get transaction from database
    const { data: transaction, error: txError } = await supabaseClient
      .from('payment_transactions')
      .select('*, internal_tokens(*)')
      .eq('id', transaction_id)
      .eq('user_id', user.id)
      .single();

    if (txError || !transaction) {
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If already completed or failed, return current status
    if (transaction.status === 'completed' || transaction.status === 'failed') {
      return new Response(
        JSON.stringify({
          status: transaction.status,
          message: transaction.status === 'completed' ? 'Payment completed' : 'Payment failed',
          transaction
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const PAYMOB_API_KEY = Deno.env.get('PAYMOB_API_KEY');
    
    if (!PAYMOB_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Payment provider not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check payment status from Paymob
    const intentionId = transaction.provider_transaction_id;
    
    if (!intentionId) {
      return new Response(
        JSON.stringify({ 
          status: transaction.status,
          message: 'Payment intention not created yet',
          transaction
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checking payment status for intention:', intentionId);

    // Check if transaction is too old (more than 30 minutes)
    const transactionAge = Date.now() - new Date(transaction.created_at).getTime();
    const thirtyMinutes = 30 * 60 * 1000;

    if (transactionAge > thirtyMinutes) {
      // Mark as failed/expired
      await supabaseClient
        .from('payment_transactions')
        .update({
          status: 'failed',
          failed_at: new Date().toISOString(),
          notes: 'Payment session expired. Please start a new payment.',
          provider_response: { error: 'Session expired after 30 minutes' }
        })
        .eq('id', transaction_id);

      return new Response(
        JSON.stringify({
          status: 'failed',
          message: 'انتهت صلاحية الدفع. يرجى بدء عملية دفع جديدة',
          transaction: {
            ...transaction,
            status: 'failed',
            notes: 'Payment session expired'
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Since Paymob doesn't support direct polling, we rely on webhook
    // For Test Mode, we'll check the transaction manually via API
    try {
      const statusResponse = await fetch(`https://accept.paymob.com/v1/intention/${intentionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${PAYMOB_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (statusResponse.ok) {
        const intentionData = await statusResponse.json();
        console.log('Intention status:', intentionData);

        // Check if payment is completed
        if (intentionData.status === 'SUCCESSFUL' || intentionData.is_live === false) {
          // Calculate tokens
          const tokens_to_credit = transaction.amount / transaction.internal_tokens.exchange_rate_usd;

          // Update transaction
          await supabaseClient
            .from('payment_transactions')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              tokens_credited: tokens_to_credit,
              provider_response: intentionData
            })
            .eq('id', transaction_id);

          // Credit user wallet
          await supabaseClient
            .from('internal_wallet_balances')
            .upsert({
              user_id: transaction.user_id,
              token_id: transaction.internal_token_id,
              balance: tokens_to_credit
            }, {
              onConflict: 'user_id,token_id'
            });

          return new Response(
            JSON.stringify({
              status: 'completed',
              message: 'تم الدفع بنجاح! ✅',
              tokens_credited: tokens_to_credit,
              transaction: {
                ...transaction,
                status: 'completed',
                tokens_credited: tokens_to_credit
              }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else if (intentionData.status === 'FAILED') {
          // Mark as failed
          await supabaseClient
            .from('payment_transactions')
            .update({
              status: 'failed',
              failed_at: new Date().toISOString(),
              provider_response: intentionData
            })
            .eq('id', transaction_id);

          return new Response(
            JSON.stringify({
              status: 'failed',
              message: 'فشل الدفع ❌',
              transaction: {
                ...transaction,
                status: 'failed'
              }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    } catch (apiError) {
      console.error('Paymob API check error:', apiError);
    }

    // If we can't determine status, return pending
    return new Response(
      JSON.stringify({
        status: transaction.status,
        message: 'لا يمكن التحقق من الحالة حالياً. إذا أكملت الدفع، انتظر قليلاً ثم تحقق مرة أخرى.',
        transaction
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );


  } catch (error) {
    console.error('Check payment status error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
