import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  amount: number;
  payment_method: 'vodafone_cash' | 'orange_cash' | 'etisalat_cash' | 'fawry' | 'card';
  phone_number?: string;
  internal_token_symbol: string;
}

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

    const { amount, payment_method, phone_number, internal_token_symbol }: PaymentRequest = await req.json();

    // Validate input
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get internal token
    const { data: token_data, error: token_error } = await supabaseClient
      .from('internal_tokens')
      .select('*')
      .eq('symbol', internal_token_symbol)
      .eq('is_active', true)
      .single();

    if (token_error || !token_data) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate tokens to credit (amount in EGP / exchange rate)
    const tokens_to_credit = amount / token_data.exchange_rate_usd;

    // Create payment transaction
    const { data: transaction, error: transaction_error } = await supabaseClient
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        amount,
        currency: 'EGP',
        payment_method,
        status: 'pending',
        provider: 'paymob',
        phone_number,
        internal_token_id: token_data.id,
        tokens_credited: 0,
        user_agent: req.headers.get('user-agent'),
      })
      .select()
      .single();

    if (transaction_error) {
      console.error('Transaction creation error:', transaction_error);
      return new Response(
        JSON.stringify({ error: 'Failed to create transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Paymob Integration
    const PAYMOB_API_KEY = Deno.env.get('PAYMOB_API_KEY');
    
    if (!PAYMOB_API_KEY) {
      // Update transaction as failed
      await supabaseClient
        .from('payment_transactions')
        .update({ 
          status: 'failed', 
          failed_at: new Date().toISOString(),
          notes: 'Paymob API key not configured'
        })
        .eq('id', transaction.id);

      return new Response(
        JSON.stringify({ 
          error: 'Payment provider not configured',
          transaction_id: transaction.id
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Get Paymob auth token
    const authResponse = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: PAYMOB_API_KEY })
    });

    if (!authResponse.ok) {
      await supabaseClient
        .from('payment_transactions')
        .update({ 
          status: 'failed', 
          failed_at: new Date().toISOString(),
          notes: 'Paymob authentication failed'
        })
        .eq('id', transaction.id);

      return new Response(
        JSON.stringify({ error: 'Payment provider authentication failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { token: paymob_token } = await authResponse.json();

    // Step 2: Create Paymob order
    const orderResponse = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: paymob_token,
        delivery_needed: false,
        amount_cents: amount * 100, // Convert to cents
        currency: 'EGP',
        merchant_order_id: transaction.id,
        items: [{
          name: `شحن ${internal_token_symbol}`,
          amount_cents: amount * 100,
          quantity: 1
        }]
      })
    });

    if (!orderResponse.ok) {
      await supabaseClient
        .from('payment_transactions')
        .update({ 
          status: 'failed', 
          failed_at: new Date().toISOString(),
          notes: 'Failed to create Paymob order'
        })
        .eq('id', transaction.id);

      return new Response(
        JSON.stringify({ error: 'Failed to create payment order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const order = await orderResponse.json();

    // Update transaction with Paymob reference
    await supabaseClient
      .from('payment_transactions')
      .update({ 
        status: 'processing',
        provider_transaction_id: order.id.toString(),
        provider_response: order
      })
      .eq('id', transaction.id);

    // Step 3: Get payment key (for mobile wallets or cards)
    const paymentKeyData = {
      auth_token: paymob_token,
      amount_cents: amount * 100,
      expiration: 3600,
      order_id: order.id,
      billing_data: {
        phone_number: phone_number || '01000000000',
        first_name: 'User',
        last_name: 'User',
        email: user.email || 'user@example.com',
        apartment: 'NA',
        floor: 'NA',
        street: 'NA',
        building: 'NA',
        shipping_method: 'NA',
        postal_code: 'NA',
        city: 'Cairo',
        country: 'EG',
        state: 'Cairo'
      },
      currency: 'EGP',
      integration_id: payment_method === 'card' ? 966436 : 
                      payment_method === 'vodafone_cash' ? 966435 : 
                      payment_method === 'orange_cash' || payment_method === 'etisalat_cash' ? 5347471 :
                      payment_method === 'fawry' ? 5347367 : 966436
    };
    
    console.log('Requesting payment key with data:', {
      ...paymentKeyData,
      auth_token: '***' // Hide token in logs
    });
    
    const paymentKeyResponse = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentKeyData)
    });

    if (!paymentKeyResponse.ok) {
      const errorData = await paymentKeyResponse.json().catch(() => ({}));
      console.error('Paymob payment key error:', {
        status: paymentKeyResponse.status,
        statusText: paymentKeyResponse.statusText,
        errorData
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate payment key',
          details: errorData,
          status: paymentKeyResponse.status
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { token: payment_token } = await paymentKeyResponse.json();

    // Return payment URL or iframe token
    const payment_url = `https://accept.paymob.com/api/acceptance/iframes/966436?payment_token=${payment_token}`;

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transaction.id,
        payment_url,
        payment_token,
        tokens_to_credit,
        message: 'Payment initiated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
