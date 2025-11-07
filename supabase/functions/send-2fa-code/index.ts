import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Send2FARequest {
  email: string;
  code: string;
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code, userName }: Send2FARequest = await req.json();

    if (!email || !code) {
      throw new Error("Email and code are required");
    }

    console.log(`Sending 2FA code to ${email}`);

    const emailResponse = await resend.emails.send({
      from: "Anubis Security <onboarding@resend.dev>",
      to: [email],
      subject: "رمز التحقق الثنائي | 2FA Verification Code",
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔐 رمز التحقق الثنائي</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">2FA Verification Code</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              ${userName ? `<p style="font-size: 16px; color: #333; margin-bottom: 20px;">مرحباً ${userName}،</p>` : ''}
              
              <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 30px;">
                تم طلب رمز التحقق الثنائي لحسابك في Anubis. استخدم الرمز التالي لإتمام عملية تسجيل الدخول:
              </p>
              
              <!-- Code Box -->
              <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0;">
                <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">رمز التحقق الخاص بك</p>
                <p style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                  ${code}
                </p>
              </div>
              
              <p style="font-size: 14px; color: #666; line-height: 1.6; margin-top: 30px;">
                • هذا الرمز صالح لمدة <strong>10 دقائق</strong> فقط<br>
                • لا تشارك هذا الرمز مع أي شخص<br>
                • إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد
              </p>
              
              <!-- English Version -->
              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e0e0e0;">
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                  A 2FA verification code was requested for your Anubis account. Use the code above to complete your login.
                </p>
                <p style="font-size: 14px; color: #666; line-height: 1.6; margin-top: 15px;">
                  • This code is valid for <strong>10 minutes</strong> only<br>
                  • Never share this code with anyone<br>
                  • If you didn't request this code, please ignore this email
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Anubis Digital Vault - Military-Grade Security
              </p>
              <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                This is an automated security message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("2FA email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending 2FA email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
