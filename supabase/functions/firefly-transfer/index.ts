// FireFly - Transfer Tokens
// POST body: { namespace?: string, pool: string, amount: string|number, to: string, from?: string }

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
    if (!apiUrl || !username || !password) {
      return new Response(JSON.stringify({ error: 'FireFly credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const body = await req.json().catch(() => ({}));
    const namespace = body.namespace || 'XcX';
    const { pool, amount, to, from } = body;
    if (!pool || !amount || !to) {
      return new Response(JSON.stringify({ error: 'pool, amount and to are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const baseUrl = buildBaseUrl(apiUrl);
    const authHeader = 'Basic ' + btoa(`${username}:${password}`);

    const payload: Record<string, unknown> = { pool, amount: String(amount), to };
    if (from) payload.from = from;

    const res = await fetch(`${baseUrl}/api/v1/namespaces/${namespace}/tokens/transfers`, {
      method: 'POST',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let data: unknown; try { data = JSON.parse(text); } catch { data = text; }
    return new Response(JSON.stringify({ success: res.ok, httpStatus: res.status, result: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('firefly-transfer error:', err);
    return new Response(JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
