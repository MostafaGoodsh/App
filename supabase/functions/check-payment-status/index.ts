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

    // Query Paymob API for payment intention status
    const statusResponse = await fetch(`https://accept.paymob.com/v1/intention/${intentionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${PAYMOB_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!statusResponse.ok) {
      const errorData = await statusResponse.json().catch(() => ({}));
      console.error('Paymob status check error:', {
        status: statusResponse.status,
        statusText: statusResponse.statusText,
        errorData
      });

      return new Response(
        JSON.stringify({ 
          error: 'Failed to check payment status',
          details: errorData,
          status: statusResponse.status
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const intentionData = await statusResponse.json();
    console.log('Payment intention status:', {
      id: intentionData.id,
      status: intentionData.status,
      confirmed: intentionData.confirmed
    });

    // Update transaction based on Paymob status
    let newStatus = transaction.status;
    let updateData: any = {
      provider_response: intentionData
    };

    if (intentionData.confirmed && intentionData.status === 'SUCCESSFUL') {
      // Payment successful - complete the transaction
      const tokens_to_credit = transaction.amount / transaction.internal_tokens.exchange_rate_usd;
      
      newStatus = 'completed';
      updateData = {
        ...updateData,
        status: 'completed',
        completed_at: new Date().toISOString(),
        tokens_credited: tokens_to_credit
      };

      // Credit user's internal wallet
      await supabaseClient.rpc('increment_balance', {
        p_user_id: user.id,
        p_token_id: transaction.internal_token_id,
        p_amount: tokens_to_credit
      }).catch(async () => {
        // If RPC fails, try direct insert
        await supabaseClient
          .from('internal_wallet_balances')
          .upsert({
            user_id: user.id,
            token_id: transaction.internal_token_id,
            balance: tokens_to_credit
          }, {
            onConflict: 'user_id,token_id'
          });
      });

      console.log('Payment completed successfully:', {
        transaction_id,
        tokens_credited: tokens_to_credit
      });
    } else if (intentionData.status === 'FAILED' || intentionData.status === 'EXPIRED') {
      // Payment failed or expired
      newStatus = 'failed';
      updateData = {
        ...updateData,
        status: 'failed',
        failed_at: new Date().toISOString(),
        notes: `Payment ${intentionData.status.toLowerCase()}`
      };

      console.log('Payment failed:', {
        transaction_id,
        reason: intentionData.status
      });
    }

    // Update transaction in database
    await supabaseClient
      .from('payment_transactions')
      .update(updateData)
      .eq('id', transaction_id);

    return new Response(
      JSON.stringify({
        status: newStatus,
        paymob_status: intentionData.status,
        confirmed: intentionData.confirmed,
        message: newStatus === 'completed' ? 'تم الدفع بنجاح' :
                 newStatus === 'failed' ? 'فشل الدفع' :
                 'الدفع قيد المعالجة',
        transaction: {
          ...transaction,
          ...updateData
        }
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
