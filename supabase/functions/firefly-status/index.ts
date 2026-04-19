// FireFly SuperNode - Status Check
// يختبر الاتصال بنود FireFly ويرجع حالة النود + الـ namespaces المتاحة

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiUrl = Deno.env.get('FIREFLY_API_URL');
    const username = Deno.env.get('FIREFLY_USERNAME');
    const password = Deno.env.get('FIREFLY_PASSWORD');

    if (!apiUrl || !username || !password) {
      return new Response(
        JSON.stringify({ error: 'FireFly credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize base URL: remove trailing slash and strip /api if present
    const baseUrl = apiUrl.replace(/\/$/, '').replace(/\/api$/, '');
    const authHeader = 'Basic ' + btoa(`${username}:${password}`);

    // 1) Get node status
    const statusRes = await fetch(`${baseUrl}/api/v1/status`, {
      headers: { Authorization: authHeader, Accept: 'application/json' },
    });

    const statusBody = await statusRes.text();
    let statusJson: unknown;
    try { statusJson = JSON.parse(statusBody); } catch { statusJson = statusBody; }

    if (!statusRes.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          step: 'status',
          httpStatus: statusRes.status,
          response: statusJson,
          hint: 'Check FIREFLY_API_URL / username / password',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2) Get namespaces
    const nsRes = await fetch(`${baseUrl}/api/v1/namespaces`, {
      headers: { Authorization: authHeader, Accept: 'application/json' },
    });
    const nsBody = await nsRes.text();
    let namespaces: unknown;
    try { namespaces = JSON.parse(nsBody); } catch { namespaces = nsBody; }

    return new Response(
      JSON.stringify({
        success: true,
        baseUrl,
        status: statusJson,
        namespaces,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('firefly-status error:', err);
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
