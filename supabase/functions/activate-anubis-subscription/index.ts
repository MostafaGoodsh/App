import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActivationRequest {
  transaction_id: string;
  subscription_type: string;
  duration_days: number;
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

    const { transaction_id, subscription_type, duration_days }: ActivationRequest = await req.json();

    console.log('Activating Anubis subscription for user:', user.id, {
      transaction_id,
      subscription_type,
      duration_days
    });

    // Verify payment transaction
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('payment_transactions')
      .select('*')
      .eq('id', transaction_id)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single();

    if (transactionError || !transaction) {
      console.error('Transaction verification failed:', transactionError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or incomplete transaction',
          details: transactionError?.message
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration_days);

    // Activate Anubis access
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        has_anubis_access: true,
        anubis_subscription_type: subscription_type,
        anubis_expires_at: expiresAt.toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to activate subscription:', updateError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to activate subscription',
          details: updateError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notification for user
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: user.id,
        title: '✅ تم تفعيل اشتراك الخزانة الرقمية',
        message: `تم تفعيل اشتراكك ${subscription_type === 'premium' ? 'البريميوم' : 'الأساسي'} بنجاح`,
        type: 'subscription_activated',
        is_read: false,
        action_url: '/anubis'
      });

    console.log('Anubis subscription activated successfully for user:', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription activated successfully',
        subscription_type,
        expires_at: expiresAt.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Activation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
