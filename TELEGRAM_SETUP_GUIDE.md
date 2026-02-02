# 📱 Telegram Integration Setup Guide

## Overview

This guide will set up **automatic Telegram notifications** for all customer inquiries. Every time someone submits an inquiry, it will automatically be sent to your Telegram channel.

---

## 🎯 Architecture

```
Customer submits inquiry
        ↓
INSERT into inquiries table
        ↓
Database trigger fires
        ↓
Supabase Edge Function called
        ↓
Message formatted and sent to Telegram API
        ↓
Telegram channel receives message
        ↓
✅ Done!
```

---

## 📋 Prerequisites

Before starting, you need:
1. **Telegram Bot Token** (from BotFather)
2. **Telegram Channel ID** (where messages will be sent)

Don't have them? Follow the setup steps below.

---

## 🤖 STEP 1: Create a Telegram Bot

### 1.1: Open Telegram
- Download Telegram: https://telegram.org/
- Create an account if you don't have one

### 1.2: Create Bot via BotFather
1. Open Telegram
2. Search for: `@BotFather`
3. Click on it and open the chat
4. Send: `/newbot`
5. Follow the prompts:
   - Name: `Shop Smart Central Bot` (or your choice)
   - Username: `shop_smart_bot` (must be unique, lowercase, no spaces)

### 1.3: Copy Your Bot Token
After creating the bot, BotFather will send you:
```
Here is your bot token:
123456789:ABCdefGHIjklMNOpqrsTUVwxyzABCdefGHI
```

**Save this token!** You'll need it.

---

## 📢 STEP 2: Create a Telegram Channel

### 2.1: Create Channel
1. Open Telegram
2. Click the **pencil icon** (compose)
3. Click **New Channel**
4. Channel name: `Shop Smart Inquiries` (or your choice)
5. Click **Create**

### 2.2: Add Bot to Channel
1. In the channel, click **Add Members**
2. Search for your bot: `@shop_smart_bot`
3. Add as **Administrator**

### 2.3: Get Channel ID
1. In the channel, check the channel link
2. Format is: `https://t.me/your_channel_name`
3. Channel ID is: `-100` + the numeric part from settings

**Or use this method:**
1. Send any message in the channel
2. Forward it to: `@username_to_id_bot`
3. It will give you the channel ID

**Save this ID!** Format should be: `-100123456789`

---

## 🔐 STEP 3: Add Secrets to Supabase

### 3.1: Go to Supabase Dashboard
- URL: https://app.supabase.com/project/eqhixgkcutopfbtbitfg

### 3.2: Add Secrets
1. Click **Settings** (bottom left)
2. Click **Secrets**
3. Click **Add a secret**

**Add two secrets:**

**Secret 1: TELEGRAM_BOT_TOKEN**
- Name: `TELEGRAM_BOT_TOKEN`
- Value: `123456789:ABCdefGHIjklMNOpqrsTUVwxyzABCdefGHI`
- Click **Add secret**

**Secret 2: TELEGRAM_CHANNEL_ID**
- Name: `TELEGRAM_CHANNEL_ID`
- Value: `-100123456789`
- Click **Add secret**

✅ **Both secrets saved!**

---

## 🚀 STEP 4: Deploy Edge Function

### 4.1: Go to Supabase Functions
1. In Supabase dashboard
2. Click **Functions** (left menu)
3. Click **Create a new function**
4. Name: `send-inquiry-to-telegram`
5. Click **Create**

### 4.2: Copy Function Code
1. Delete the example code
2. Copy this entire code:

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

3. Paste into the function editor
4. Click **Deploy**

✅ **Function deployed!**

---

## 💾 STEP 5: Deploy Database Migrations

### 5.1: Go to SQL Editor
- In Supabase dashboard
- Click **SQL Editor**
- Click **New Query**

### 5.2: Copy Migration SQL
Paste this SQL:

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

3. Click **Execute**

✅ **Database trigger deployed!**

---

## 🧪 STEP 6: Test the Integration

### 6.1: Go to Your App
- Open: http://localhost:5173

### 6.2: Submit a Test Inquiry
1. Go to home page
2. Find any product
3. Click "Contact" or "Inquiry"
4. Fill in:
   - Name: Test Customer
   - Email: test@example.com
   - Phone: 1234567890
   - Message: This is a test inquiry
5. Click **Submit**

### 6.3: Check Telegram
1. Open your Telegram channel: `Shop Smart Inquiries`
2. You should see a formatted message with:
   - 🔔 New Inquiry Received!
   - 👤 Customer Name: Test Customer
   - 📧 Email: test@example.com
   - 📱 Phone: 1234567890
   - 💬 Message: This is a test inquiry
   - 🕐 Created timestamp

✅ **Integration working!**

---

## ✅ Verification Checklist

- [ ] Telegram Bot created with BotFather
- [ ] Bot token saved
- [ ] Telegram Channel created
- [ ] Bot added to channel as administrator
- [ ] Channel ID saved
- [ ] Secrets added to Supabase
- [ ] Edge Function deployed
- [ ] Database trigger deployed
- [ ] Test inquiry submitted
- [ ] Test message received in Telegram channel

---

## 🔍 Troubleshooting

### Issue: No message in Telegram
**Check:**
1. Bot is added to channel as **Administrator**
2. Secrets are correct (copy-paste exact values)
3. Edge Function is **Deployed**
4. Database trigger is created
5. Check Supabase Function Logs for errors

### Issue: "Telegram credentials not configured"
**Solution:**
1. Go to Supabase Settings → Secrets
2. Verify both `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHANNEL_ID` exist
3. Re-deploy the Edge Function

### Issue: "Failed to send message to Telegram"
**Solution:**
1. Check bot token is correct
2. Check channel ID format (should start with `-100`)
3. Ensure bot is admin in the channel
4. Check Supabase Function logs

### Issue: Messages are old/not sent
**Solution:**
1. Check database trigger is active
2. Verify Edge Function is responding
3. Check Supabase logs

---

## 📝 Message Format

Each inquiry message includes:
- ✅ Customer name
- ✅ Email
- ✅ Phone number
- ✅ Product name & category (if selected)
- ✅ Customer message
- ✅ Timestamp
- ✅ Inquiry status

Example Telegram message:
```
🔔 New Inquiry Received!

👤 Customer Name: John Doe
📧 Email: john@example.com
📱 Phone: +1234567890
📦 Product: Dell XPS 13 (laptop)
💬 Message:
I'm interested in this laptop. Do you have it in stock?

🕐 Created: 2026-02-02 12:30:45
🔗 Status: pending
```

---

## 🔐 Security Notes

- Bot token is stored as a secret in Supabase
- Never share bot token publicly
- Channel ID is only known to you
- Messages are sent via secure HTTPS
- Edge Function logs are private

---

## 📞 Support

If you need help:
1. Check troubleshooting section above
2. Check Supabase Function logs
3. Verify all steps completed
4. Check Telegram bot is active

---

## 🎉 You're All Set!

Your Telegram integration is now live! Every inquiry will automatically be sent to your channel.

**Next steps:**
1. Test with real inquiries
2. Monitor Telegram channel
3. Respond to customers promptly
4. Consider adding more Telegram features (updates, replies, etc.)

---

**Integration Date**: February 2, 2026  
**Status**: ✅ Active
