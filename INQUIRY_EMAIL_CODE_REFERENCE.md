# Inquiry Email - Updated Code Reference

All updated code for sending inquiry emails to tyash1864@gmail.com.

---

## 1. Edge Function: `supabase/functions/send-inquiry-notification/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = "tyash1864@gmail.com";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

interface InquiryPayload {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    product_id: string | null;
    message: string | null;
    status: string;
    created_at: string;
    product?: {
        name: string;
        category: string;
    };
}

const handler = async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        if (!RESEND_API_KEY) {
            console.error("Missing RESEND_API_KEY");
            return new Response(
                JSON.stringify({ error: "Email service not configured" }),
                {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        const resend = new Resend(RESEND_API_KEY);
        const payload: InquiryPayload = await req.json();

        console.log("Received inquiry:", payload);

        const productInfo = payload.product
            ? `<p><strong>Product:</strong> ${payload.product.name} (${payload.product.category})</p>`
            : "";

        const messageText = payload.message
            ? `<p><strong>Message:</strong><br/>${payload.message.replace(/\n/g, "<br/>")}</p>`
            : "";

        const emailHtml = `
      <h2>🔔 New Inquiry Received</h2>
      <p><strong>Customer Name:</strong> ${payload.customer_name}</p>
      <p><strong>Email:</strong> ${payload.customer_email}</p>
      <p><strong>Phone:</strong> ${payload.customer_phone}</p>
      ${productInfo}
      ${messageText}
      <hr/>
      <p><small>Received at: ${new Date(payload.created_at).toLocaleString()}</small></p>
      <p><small>Status: ${payload.status}</small></p>
    `;

        const { data, error } = await resend.emails.send({
            from: "Shop Smart Central <onboarding@resend.dev>",
            to: [ADMIN_EMAIL],
            subject: `New Inquiry from ${payload.customer_name}`,
            html: emailHtml,
        });

        if (error) {
            console.error("Resend API Error:", error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        console.log("Email sent successfully:", data);

        return new Response(JSON.stringify({ success: true, id: data.id }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
};

serve(handler);
```

---

## 2. Migration: `supabase/migrations/20260215000000_add_email_notification.sql`

```sql
-- Enable pg_net extension to send http requests
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Create function to send inquiry email notification via Edge Function
CREATE OR REPLACE FUNCTION public.send_inquiry_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  product_data RECORD;
  inquiry_payload JSONB;
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    SELECT id, name, category INTO product_data
    FROM public.products
    WHERE id = NEW.product_id
    LIMIT 1;
  END IF;

  inquiry_payload := jsonb_build_object(
    'id', NEW.id,
    'customer_name', NEW.customer_name,
    'customer_email', NEW.customer_email,
    'customer_phone', NEW.customer_phone,
    'product_id', NEW.product_id,
    'message', NEW.message,
    'status', NEW.status,
    'created_at', NEW.created_at,
    'product', CASE WHEN product_data IS NOT NULL THEN
      jsonb_build_object(
        'id', product_data.id,
        'name', product_data.name,
        'category', product_data.category
      )
    ELSE NULL END
  );

  BEGIN
    PERFORM
      net.http_post(
        url := 'https://eqhixgkcutopfbtbitfg.supabase.co/functions/v1/send-inquiry-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json'
        ),
        body := inquiry_payload
      );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to send inquiry notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS inquiry_notification_trigger ON public.inquiries;

CREATE TRIGGER inquiry_notification_trigger
AFTER INSERT ON public.inquiries
FOR EACH ROW
EXECUTE FUNCTION public.send_inquiry_notification();

COMMENT ON FUNCTION public.send_inquiry_notification() IS
  'Automatically sends new inquiry email notifications via Edge Function';
```

---

## 3. Config: `supabase/config.toml` (relevant section)

```toml
[functions.send-inquiry-notification]
verify_jwt = false
```

---

## Deploy Commands

```bash
# Set Resend API key
npx supabase secrets set RESEND_API_KEY=re_your_key_here

# Deploy the function
npx supabase functions deploy send-inquiry-notification
```

---

## Run Migration

In **Supabase Dashboard** → **SQL Editor** → paste and run the full migration SQL above.
