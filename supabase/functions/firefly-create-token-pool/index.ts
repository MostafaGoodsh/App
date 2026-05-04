// FireFly - Create Token Pool (ERC20-like fungible) for MSRA
// POST body: { namespace?: string, name: string, symbol: string, type?: 'fungible'|'nonfungible' }

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
  } catch {
    return apiUrl.replace(/\/$/, '');
  }
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
    const name = body.name || 'MSRA';
    const symbol = body.symbol || 'MSRA';
    const type = body.type === 'nonfungible' ? 'nonfungible' : 'fungible';

    const baseUrl = buildBaseUrl(apiUrl);
    const authHeader = 'Basic ' + btoa(`${username}:${password}`);

    const res = await fetch(`${baseUrl}/api/v1/namespaces/${namespace}/tokens/pools`, {
      method: 'POST',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name, symbol, type }),
    });
    const text = await res.text();
    let data: unknown; try { data = JSON.parse(text); } catch { data = text; }

    return new Response(JSON.stringify({ success: res.ok, httpStatus: res.status, namespace, pool: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('firefly-create-token-pool error:', err);
    return new Response(JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
