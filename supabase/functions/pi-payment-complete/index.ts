import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const PI_API_URL = 'https://api.minepi.com';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentId, txid, accessToken } = await req.json();

    if (!paymentId || !txid) {
      return new Response(
        JSON.stringify({ error: 'Missing paymentId or txid' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get payment metadata to determine token amount and user
    const piAmount = result.amount || 0;
    const tokenAmount = piAmount * 100; // 1 Pi = 100 MS-RA
    const userId = result.metadata?.userId;

    if (userId && tokenAmount > 0) {
      // Get MS-RA token ID
      const { data: token } = await supabase
        .from('internal_tokens')
        .select('id')
        .eq('symbol', 'MS-RA')
        .single();

      if (token) {
        // Update or create balance
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

        // Record the transaction
        await supabase
          .from('payment_transactions')
          .insert({
            user_id: userId,
            amount: piAmount,
            currency: 'Pi',
            payment_method: 'pi_network',
            provider: 'pi_network',
            provider_transaction_id: txid,
            status: 'completed',
            tokens_credited: tokenAmount,
            completed_at: new Date().toISOString(),
          });
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
