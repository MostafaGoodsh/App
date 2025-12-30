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
    console.log('Transaction current status:', transaction.status);
    if (transaction.status === 'completed' || transaction.status === 'failed') {
      console.log('Transaction already finalized, returning status:', transaction.status);
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
    const PAYMOB_PUBLIC_KEY = Deno.env.get('PAYMOB_PUBLIC_KEY');

    if (!PAYMOB_API_KEY || !PAYMOB_PUBLIC_KEY) {
      return new Response(
        JSON.stringify({ error: 'Payment provider not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const intentionId = transaction.provider_transaction_id;
    const clientSecret = (transaction.payment_details as any)?.client_secret as string | undefined;

    if (!intentionId || !clientSecret) {
      return new Response(
        JSON.stringify({
          status: transaction.status,
          message: 'بيانات الدفع غير مكتملة (intention/client_secret غير متوفر)',
          transaction,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Client secret عادةً صالح لمدة ساعة
    const transactionAgeMs = Date.now() - new Date(transaction.created_at).getTime();
    const oneHour = 60 * 60 * 1000;

    console.log('[check-payment-status] tx:', {
      transaction_id,
      intentionId,
      ageMs: transactionAgeMs,
      status: transaction.status,
    });

    if (transactionAgeMs > oneHour) {
      console.log('[check-payment-status] Transaction expired, marking as failed');

      await supabaseClient
        .from('payment_transactions')
        .update({
          status: 'failed',
          failed_at: new Date().toISOString(),
          notes: 'Payment session expired (client_secret expired).',
          provider_response: { error: 'Session expired after 60 minutes' },
        })
        .eq('id', transaction_id);

      return new Response(
        JSON.stringify({
          status: 'failed',
          message: 'انتهت صلاحية الدفع. يرجى بدء عملية دفع جديدة',
          transaction: {
            ...transaction,
            status: 'failed',
            notes: 'Payment session expired',
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Unified Intention API: اسهل استعلام هو endpoint الخاص بالـ Elements
    // (publicKey + clientSecret) ويرجع confirmed/status/transactions.
    const intentionLookupUrl = `https://accept.paymob.com/v1/intention/element/${encodeURIComponent(PAYMOB_PUBLIC_KEY)}/${encodeURIComponent(clientSecret)}/`;

    console.log('[check-payment-status] Fetching intention:', intentionLookupUrl);

    const intentionRes = await fetch(intentionLookupUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const intentionText = await intentionRes.text();
    let intentionData: any = null;

    try {
      intentionData = intentionText ? JSON.parse(intentionText) : null;
    } catch {
      // ignore JSON parse error
    }

    if (!intentionRes.ok || !intentionData) {
      console.error('[check-payment-status] Intention lookup failed:', {
        status: intentionRes.status,
        body: intentionText?.slice(0, 1000),
      });

      return new Response(
        JSON.stringify({
          status: transaction.status,
          message: 'لا يمكن التحقق من الحالة حالياً. حاول مرة أخرى بعد قليل.',
          transaction,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[check-payment-status] Intention data:', {
      intention_status: intentionData.status,
      confirmed: intentionData.confirmed,
      transactions_count: Array.isArray(intentionData.transactions) ? intentionData.transactions.length : undefined,
      transaction_records_count: Array.isArray(intentionData.transaction_records) ? intentionData.transaction_records.length : undefined,
    });

    const statusRaw = String(intentionData.status ?? '').toLowerCase();
    const confirmed = Boolean(intentionData.confirmed);

    // Heuristics لنجاح العملية
    const hasSuccessfulTransaction =
      (Array.isArray(intentionData.transactions) &&
        intentionData.transactions.some((t: any) =>
          Boolean(
            t?.success === true ||
              t?.is_success === true ||
              t?.is_paid === true ||
              String(t?.status ?? '').toLowerCase() === 'success' ||
              String(t?.status ?? '').toLowerCase() === 'successful' ||
              String(t?.status ?? '').toLowerCase() === 'processed' ||
              String(t?.status ?? '').toLowerCase() === 'captured'
          )
        )) ||
      (Array.isArray(intentionData.transaction_records) &&
        intentionData.transaction_records.some((t: any) =>
          Boolean(
            t?.success === true ||
              t?.is_success === true ||
              t?.is_paid === true ||
              String(t?.status ?? '').toLowerCase() === 'success' ||
              String(t?.status ?? '').toLowerCase() === 'successful' ||
              String(t?.status ?? '').toLowerCase() === 'processed' ||
              String(t?.status ?? '').toLowerCase() === 'captured'
          )
        ));

    const isSuccessful = confirmed || hasSuccessfulTransaction || ['processed', 'successful', 'captured', 'paid', 'confirmed'].includes(statusRaw);
    const isFailed = ['failed', 'declined', 'expired', 'canceled', 'cancelled', 'voided'].includes(statusRaw);

    if (isSuccessful) {
      console.log('[check-payment-status] Payment confirmed ✅');

      const tokens_to_credit = transaction.amount / transaction.internal_tokens.exchange_rate_usd;

      // Update transaction
      const { error: updateTxError } = await supabaseClient
        .from('payment_transactions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          tokens_credited: tokens_to_credit,
          provider_response: intentionData,
        })
        .eq('id', transaction_id);

      if (updateTxError) {
        console.error('[check-payment-status] Failed updating transaction:', updateTxError);
      }

      // Credit wallet (increment balance)
      const { data: existingBalance, error: balFetchError } = await supabaseClient
        .from('internal_wallet_balances')
        .select('balance')
        .eq('user_id', transaction.user_id)
        .eq('token_id', transaction.internal_token_id)
        .maybeSingle();

      if (balFetchError) {
        console.error('[check-payment-status] Failed fetching balance:', balFetchError);
      }

      const newBalance = (existingBalance?.balance ?? 0) + tokens_to_credit;

      const { error: balUpsertError } = await supabaseClient
        .from('internal_wallet_balances')
        .upsert(
          {
            user_id: transaction.user_id,
            token_id: transaction.internal_token_id,
            balance: newBalance,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,token_id' }
        );

      if (balUpsertError) {
        console.error('[check-payment-status] Failed updating balance:', balUpsertError);
      }

      return new Response(
        JSON.stringify({
          status: 'completed',
          message: 'تم الدفع بنجاح! ✅',
          tokens_credited: tokens_to_credit,
          transaction: {
            ...transaction,
            status: 'completed',
            tokens_credited: tokens_to_credit,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (isFailed) {
      console.log('[check-payment-status] Payment failed ❌', { statusRaw });

      await supabaseClient
        .from('payment_transactions')
        .update({
          status: 'failed',
          failed_at: new Date().toISOString(),
          notes: `Payment ${statusRaw}`,
          provider_response: intentionData,
        })
        .eq('id', transaction_id);

      return new Response(
        JSON.stringify({
          status: 'failed',
          message: 'فشل الدفع ❌',
          reason: statusRaw,
          transaction: {
            ...transaction,
            status: 'failed',
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[check-payment-status] Payment still processing...', { statusRaw, confirmed });

    return new Response(
      JSON.stringify({
        status: transaction.status,
        message: 'الدفع قيد المعالجة. إذا أكملت الدفع، انتظر قليلاً ثم تحقق مرة أخرى.',
        transaction,
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
