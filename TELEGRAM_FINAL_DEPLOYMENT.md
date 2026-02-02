# 🚀 TELEGRAM DEPLOYMENT - YOUR FINAL STEP

## ✅ You Have Everything!

**Bot Token**: ✅  
**Channel ID**: ✅  
**Code**: ✅  

Now just **3 final steps** to go live!

---

## 📝 STEP 1: Add Secrets to Supabase

**Go to**: https://app.supabase.com/project/eqhixgkcutopfbtbitfg

**Click**: Settings (bottom left) → Secrets → Add a secret

**Add Secret 1:**
```
Name: TELEGRAM_BOT_TOKEN
Value: 8499568899:AAHWEvUjpRrg48I9H1q8eQM0GoOW6F765y0
```
Click: Add secret

**Add Secret 2:**
```
Name: TELEGRAM_CHANNEL_ID
Value: -1008520138930
```
Click: Add secret

✅ **Secrets saved!**

---

## 🔧 STEP 2: Deploy Edge Function

**Go to**: Supabase Dashboard → Functions (left menu)

**Click**: Create a new function

**Function name**: `send-inquiry-to-telegram`

**Click**: Create

**Replace code with** (from file: `supabase/functions/send-inquiry-to-telegram/index.ts`):

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const TELEGRAM_CHANNEL_ID = Deno.env.get("TELEGRAM_CHANNEL_ID");

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
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: { "Content-Type": "text/plain" } });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
      console.error("Missing Telegram configuration");
      return new Response(
        JSON.stringify({
          error: "Telegram credentials not configured",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const payload: InquiryPayload = await req.json();

    const message = formatTelegramMessage(payload);

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHANNEL_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    if (!telegramResponse.ok) {
      const error = await telegramResponse.text();
      console.error("Telegram API error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to send message to Telegram",
          details: error,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await telegramResponse.json();
    console.log("Message sent to Telegram:", result);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Inquiry sent to Telegram",
        telegram_message_id: result.result.message_id,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

function formatTelegramMessage(inquiry: InquiryPayload): string {
  const productInfo = inquiry.product
    ? `\n📦 <b>Product:</b> ${inquiry.product.name} (${inquiry.product.category})`
    : "";

  const messageText = inquiry.message ? `\n💬 <b>Message:</b>\n${inquiry.message}` : "";

  return `
<b>🔔 New Inquiry Received!</b>

👤 <b>Customer Name:</b> ${inquiry.customer_name}
📧 <b>Email:</b> <code>${inquiry.customer_email}</code>
📱 <b>Phone:</b> <code>${inquiry.customer_phone}</code>${productInfo}${messageText}

🕐 <b>Created:</b> ${new Date(inquiry.created_at).toLocaleString()}
🔗 <b>Status:</b> <code>${inquiry.status}</code>
`;
}

serve(handler);
```

**Click**: Deploy

✅ **Edge Function deployed!**

---

## 💾 STEP 3: Deploy Database Trigger

**Go to**: Supabase Dashboard → SQL Editor

**Click**: New Query

**Paste this SQL** (from file: `supabase/migrations/20260202000002_add_telegram_integration.sql`):

```sql
-- Create function to send inquiry to Telegram via Edge Function
CREATE OR REPLACE FUNCTION public.send_inquiry_to_telegram()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  product_data RECORD;
  inquiry_payload JSONB;
BEGIN
  -- Get product information if inquiry has a product_id
  IF NEW.product_id IS NOT NULL THEN
    SELECT id, name, category INTO product_data
    FROM public.products
    WHERE id = NEW.product_id
    LIMIT 1;
  END IF;

  -- Build the payload
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

  -- Call the edge function
  BEGIN
    PERFORM
      net.http_post(
        url := 'https://' || current_setting('app.supabase_project_ref') || '.supabase.co/functions/v1/send-inquiry-to-telegram',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
        ),
        body := inquiry_payload
      );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to send inquiry to Telegram: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS inquiry_to_telegram_trigger ON public.inquiries;

-- Create trigger on INSERT
CREATE TRIGGER inquiry_to_telegram_trigger
AFTER INSERT ON public.inquiries
FOR EACH ROW
EXECUTE FUNCTION public.send_inquiry_to_telegram();

-- Comment
COMMENT ON FUNCTION public.send_inquiry_to_telegram() IS
  'Automatically sends new inquiries to Telegram channel via Edge Function';
```

**Click**: Execute

✅ **Database trigger deployed!**

---

## 🧪 TEST IT!

1. **Open your app**: http://localhost:5173

2. **Submit an inquiry**:
   - Go to any product
   - Click Contact/Inquiry
   - Fill in details
   - Click Submit

3. **Check Telegram**:
   - Open your Telegram channel
   - Look for the message with:
     - 🔔 New Inquiry Received!
     - Customer details
     - Product info
     - Timestamp

✅ **If you see the message - YOU'RE DONE!**

---

## 🎉 COMPLETE!

Your Telegram integration is now **LIVE**!

**Every inquiry will automatically be sent to your Telegram channel.**

---

## 📞 Troubleshooting

If no message appears:

1. **Check secrets are saved**
   - Settings → Secrets
   - Both TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID should exist

2. **Check Edge Function is deployed**
   - Functions → send-inquiry-to-telegram
   - Status should show "Active"

3. **Check database trigger is created**
   - SQL Editor → Run: `SELECT * FROM pg_trigger WHERE tgname = 'inquiry_to_telegram_trigger';`
   - Should return a result

4. **Check bot is admin in channel**
   - Telegram channel → Members
   - Your bot should be listed as Admin

5. **Check bot token is correct**
   - Token: 8499568899:AAHWEvUjpRrg48I9H1q8eQM0GoOW6F765y0
   - Verify it matches exactly

---

## ✅ Deployment Checklist

- [ ] Secrets added to Supabase
- [ ] Edge Function deployed
- [ ] Database trigger deployed
- [ ] Test inquiry submitted
- [ ] Message received in Telegram
- [ ] Integration working! 🎉

---

**Status**: 🟢 **READY TO USE**

Your Shop Smart Central now automatically sends all inquiries to Telegram!
