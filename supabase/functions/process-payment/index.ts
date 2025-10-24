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

    // Paymob Integration - Using Flash API (Unified Intention API)
    const PAYMOB_API_KEY = Deno.env.get('PAYMOB_API_KEY');
    
    if (!PAYMOB_API_KEY) {
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

    // Get integration ID based on payment method
    // Integration IDs من Paymob Dashboard (Live Mode)
    const integration_id = payment_method === 'card' ? 1783487 :           // Card integration (Live)
                          payment_method === 'fawry' ? 1197843 :          // Kiosk/Fawry (Live)
                          1197843;                                        // Wallet (All mobile wallets: Vodafone, Etisalat, Orange) (Live)

    console.log('Payment method selected:', payment_method, 'Integration ID:', integration_id);
    console.log('Phone number received:', phone_number);

    // Create Payment Intention using Flash API
    const intentionData = {
      amount: amount * 100, // Amount in cents (piasters)
      currency: 'EGP',
      payment_methods: [integration_id],
      billing_data: {
        apartment: 'NA',
        first_name: user.user_metadata?.full_name || 'User',
        last_name: 'User',
        street: 'NA',
        building: 'NA',
        phone_number: phone_number || '+201000000000',
        city: 'Cairo',
        country: 'EG',
        email: user.email || 'user@example.com',
        floor: 'NA',
        state: 'Cairo'
      },
      customer: {
        first_name: user.user_metadata?.full_name || 'User',
        last_name: 'User',
        email: user.email || 'user@example.com'
      },
      items: [{
        name: `شحن ${internal_token_symbol}`,
        amount: amount * 100, // Amount in cents
        description: `Recharge ${internal_token_symbol} tokens`,
        quantity: 1
      }],
      special_reference: transaction.id, // معرّف المعاملة للربط
      redirection_url: `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}.lovableproject.com/recharge?payment=success&transaction_id=${transaction.id}`
    };

    console.log('Creating payment intention with data:', {
      ...intentionData,
      billing_data: { ...intentionData.billing_data, phone_number: '***' }
    });

    const intentionResponse = await fetch('https://accept.paymob.com/v1/intention/', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Token ${PAYMOB_API_KEY}`
      },
      body: JSON.stringify(intentionData)
    });

    if (!intentionResponse.ok) {
      const errorData = await intentionResponse.json().catch(() => ({}));
      console.error('Paymob intention creation error:', {
        status: intentionResponse.status,
        statusText: intentionResponse.statusText,
        errorData
      });

      await supabaseClient
        .from('payment_transactions')
        .update({ 
          status: 'failed', 
          failed_at: new Date().toISOString(),
          notes: 'Failed to create payment intention',
          provider_response: errorData
        })
        .eq('id', transaction.id);

      return new Response(
        JSON.stringify({ 
          error: 'Failed to create payment intention',
          details: errorData,
          status: intentionResponse.status
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const intentionResult = await intentionResponse.json();
    console.log('Payment intention created successfully:', {
      intention_id: intentionResult.id,
      client_secret: intentionResult.client_secret ? 'present' : 'missing'
    });

    // Update transaction with Paymob reference and save client_secret
    await supabaseClient
      .from('payment_transactions')
      .update({ 
        status: 'processing',
        provider_transaction_id: intentionResult.id?.toString(),
        provider_response: intentionResult,
        payment_details: {
          client_secret: intentionResult.client_secret,
          intention_id: intentionResult.id
        }
      })
      .eq('id', transaction.id);

    // Get Public Key from environment
    const PAYMOB_PUBLIC_KEY = Deno.env.get('PAYMOB_PUBLIC_KEY');
    
    // Build redirect URL with client_secret (حسب Postman Collection)
    const payment_url = `https://accept.paymob.com/unifiedcheckout/?publicKey=${PAYMOB_PUBLIC_KEY}&clientSecret=${intentionResult.client_secret}`;

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transaction.id,
        payment_url,
        client_secret: intentionResult.client_secret,
        intention_id: intentionResult.id,
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
