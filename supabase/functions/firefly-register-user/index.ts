// FireFly - Register/Ensure user key on Kaleido
// POST body: { user_id: string, namespace?: string }
// Creates a key for the user via FireFly identity API and persists it in blockchain_user_keys.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function buildBaseUrl(apiUrl: string): string {
  try {
    const u = new URL(apiUrl);
    const userInfo = u.username ? `${u.username}${u.password ? ':' + u.password : ''}@` : '';
    return `${u.protocol}//${userInfo}${u.host}`;
  } catch { return apiUrl.replace(/\/$/, ''); }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const apiUrl = Deno.env.get('FIREFLY_API_URL');
    const username = Deno.env.get('FIREFLY_USERNAME');
    const password = Deno.env.get('FIREFLY_PASSWORD');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!apiUrl || !username || !password || !supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'Server not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json().catch(() => ({}));
    const userId: string = body.user_id;
    const namespace: string = body.namespace || 'XcX';

    if (!userId || typeof userId !== 'string') {
      return new Response(JSON.stringify({ error: 'user_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Check if user already has a key
    const { data: existing } = await supabase
      .from('blockchain_user_keys')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing && existing.status === 'active' && existing.eth_address) {
      return new Response(JSON.stringify({ success: true, alreadyExists: true, key: existing }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Upsert pending row
    if (!existing) {
      await supabase.from('blockchain_user_keys').insert({
        user_id: userId, namespace, status: 'pending'
      });
    }

    const baseUrl = buildBaseUrl(apiUrl);
    const authHeader = 'Basic ' + btoa(`${username}:${password}`);

    // Create a FireFly identity (verifier/key) for this user
    // Use the namespace identities endpoint
    const identityName = `user-${userId.substring(0, 8)}-${Date.now()}`;
    const res = await fetch(`${baseUrl}/api/v1/namespaces/${namespace}/identities`, {
      method: 'POST',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: identityName,
        type: 'custom',
        profile: { lovable_user_id: userId },
      }),
    });
    const text = await res.text();
    let data: any; try { data = JSON.parse(text); } catch { data = text; }

    if (!res.ok) {
      await supabase.from('blockchain_user_keys').update({
        status: 'failed', error_message: typeof data === 'string' ? data : JSON.stringify(data),
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId);
      return new Response(JSON.stringify({ success: false, httpStatus: res.status, error: data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const fireflyIdentity = data?.id || data?.did || identityName;
    const ethAddress = data?.verifiers?.[0]?.value || data?.key || null;

    await supabase.from('blockchain_user_keys').update({
      firefly_identity: fireflyIdentity,
      firefly_key: identityName,
      eth_address: ethAddress,
      status: 'active',
      error_message: null,
      metadata: data,
      updated_at: new Date().toISOString(),
    }).eq('user_id', userId);

    return new Response(JSON.stringify({ success: true, identity: fireflyIdentity, eth_address: ethAddress, raw: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('firefly-register-user error:', err);
    return new Response(JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
