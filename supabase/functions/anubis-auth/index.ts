import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { action, email, password, full_name, phone } = await req.json();

    console.log('Anubis Auth Request:', { action, email });

    if (action === 'register') {
      // التحقق من البيانات المطلوبة
      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: 'Email and password are required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // التحقق من وجود المستخدم
      const { data: existingUser } = await supabaseClient
        .from('anubis_users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'البريد الإلكتروني مسجل بالفعل' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // تشفير كلمة المرور (في الإنتاج، استخدم bcrypt أو argon2)
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const password_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // إنشاء المستخدم
      const { data: newUser, error: createError } = await supabaseClient
        .from('anubis_users')
        .insert({
          email,
          password_hash,
          full_name,
          phone,
          subscription_type: 'free_trial',
          status: 'active'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return new Response(
          JSON.stringify({ error: 'فشل في إنشاء الحساب' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // إنشاء جلسة
      const session_token = crypto.randomUUID() + '-' + Date.now();
      const expires_at = new Date();
      expires_at.setDate(expires_at.getDate() + 30); // صلاحية 30 يوم

      const { error: sessionError } = await supabaseClient
        .from('anubis_sessions')
        .insert({
          anubis_user_id: newUser.id,
          session_token,
          expires_at: expires_at.toISOString(),
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown'
        });

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        return new Response(
          JSON.stringify({ error: 'فشل في إنشاء الجلسة' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: newUser.id,
            email: newUser.email,
            full_name: newUser.full_name,
            subscription_type: newUser.subscription_type
          },
          session_token,
          expires_at
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'login') {
      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: 'Email and password are required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // تشفير كلمة المرور للمقارنة
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const password_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // البحث عن المستخدم
      const { data: user, error: userError } = await supabaseClient
        .from('anubis_users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password_hash)
        .single();

      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      if (user.status !== 'active') {
        return new Response(
          JSON.stringify({ error: 'الحساب غير نشط' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      // إنشاء جلسة جديدة
      const session_token = crypto.randomUUID() + '-' + Date.now();
      const expires_at = new Date();
      expires_at.setDate(expires_at.getDate() + 30);

      const { error: sessionError } = await supabaseClient
        .from('anubis_sessions')
        .insert({
          anubis_user_id: user.id,
          session_token,
          expires_at: expires_at.toISOString(),
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown'
        });

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        return new Response(
          JSON.stringify({ error: 'فشل في إنشاء الجلسة' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // تحديث آخر تسجيل دخول
      await supabaseClient
        .from('anubis_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            subscription_type: user.subscription_type
          },
          session_token,
          expires_at
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'logout') {
      const { session_token } = await req.json();
      
      if (session_token) {
        await supabaseClient
          .from('anubis_sessions')
          .delete()
          .eq('session_token', session_token);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});