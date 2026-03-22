import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const PI_API_URL = 'https://api.minepi.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { paymentId, txid, networkMode } = await req.json();

    if (!paymentId || !txid) {
      return new Response(
        JSON.stringify({ error: 'Missing paymentId or txid' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!authHeader?.startsWith('Bearer ') || !supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized request' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized request' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const PI_API_KEY = Deno.env.get('PI_API_KEY');
    if (!PI_API_KEY) {
      console.error('PI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Complete the payment with Pi Network API
    const response = await fetch(`${PI_API_URL}/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pi API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to complete payment', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log('Payment completed:', result);

    // Credit tokens to user's internal wallet
    const piAmount = result.amount || 0;
    const tokenAmount = piAmount * 100; // 1 Pi = 100 MS-RA
    const userId = result.metadata?.userId || userData.user.id;
    const networkLabel = networkMode === 'mainnet' ? 'Pi Mainnet' : 'Pi Testnet';

    if (result.metadata?.userId && result.metadata.userId !== userData.user.id) {
      return new Response(
        JSON.stringify({ error: 'User mismatch for payment completion' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (userId && tokenAmount > 0) {
      const { data: token } = await supabase
        .from('internal_tokens')
        .select('id, symbol')
        .in('symbol', ['$MS-RA', 'MS-RA', 'MSRA'])
        .limit(1)
        .maybeSingle();

      if (token) {
        const { data: existingBalance } = await supabase
          .from('internal_wallet_balances')
          .select('id, balance')
          .eq('user_id', userId)
          .eq('token_id', token.id)
          .single();

        if (existingBalance) {
          await supabase
            .from('internal_wallet_balances')
            .update({ 
              balance: existingBalance.balance + tokenAmount,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingBalance.id);
        } else {
          await supabase
            .from('internal_wallet_balances')
            .insert({
              user_id: userId,
              token_id: token.id,
              balance: tokenAmount,
            });
        }

        const paymentPayload = {
          user_id: userId,
          amount: piAmount,
          currency: 'PI',
          payment_method: 'pi_network',
          provider: 'pi_network',
          provider_transaction_id: txid,
          provider_reference: paymentId,
          status: 'completed',
          tokens_credited: tokenAmount,
          internal_token_id: token.id,
          completed_at: new Date().toISOString(),
          payment_details: {
            network_mode: networkMode || 'testnet',
            network_label: networkLabel,
            token_symbol: token.symbol,
            token_amount: tokenAmount,
            source_amount: piAmount,
            source_currency: 'PI',
            txid,
            pi_user_uid: result.user_uid,
            pi_username: result.metadata?.piUsername || null,
            explorer_url: result.transaction?._link || null,
          },
        };

        const { data: existingTransaction } = await supabase
          .from('payment_transactions')
          .select('id')
          .eq('provider_reference', paymentId)
          .maybeSingle();

        if (existingTransaction?.id) {
          await supabase.from('payment_transactions').update(paymentPayload).eq('id', existingTransaction.id);
        } else {
          await supabase.from('payment_transactions').insert(paymentPayload);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, payment: result, tokensCreated: tokenAmount }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error completing payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
