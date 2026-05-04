// FireFly - Read Token Balance
// GET ?namespace=XcX&pool=<poolId>&key=<address>

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    let namespace = 'XcX', pool = '', key = '';
    if (req.method === 'GET') {
      const url = new URL(req.url);
      namespace = url.searchParams.get('namespace') || namespace;
      pool = url.searchParams.get('pool') || '';
      key = url.searchParams.get('key') || '';
    } else {
      const body = await req.json().catch(() => ({}));
      namespace = body.namespace || namespace;
      pool = body.pool || '';
      key = body.key || '';
    }

    const baseUrl = buildBaseUrl(apiUrl);
    const authHeader = 'Basic ' + btoa(`${username}:${password}`);

    const params = new URLSearchParams();
    if (pool) params.set('pool', pool);
    if (key) params.set('key', key);

    const res = await fetch(`${baseUrl}/api/v1/namespaces/${namespace}/tokens/balances?${params}`, {
      headers: { Authorization: authHeader, Accept: 'application/json' },
    });
    const text = await res.text();
    let data: unknown; try { data = JSON.parse(text); } catch { data = text; }
    return new Response(JSON.stringify({ success: res.ok, httpStatus: res.status, balances: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('firefly-balance error:', err);
    return new Response(JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
