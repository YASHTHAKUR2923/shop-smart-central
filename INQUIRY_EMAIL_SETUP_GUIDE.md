# 📧 Complete Guide: Inquiry Email Notifications to tyash1864@gmail.com

This guide explains **everything** you need to do so that whenever a customer submits an inquiry, you receive an email at **tyash1864@gmail.com**.

---

## 🎯 What Happens (Flow)

1. Customer fills the inquiry/contact form and clicks Submit  
2. The inquiry is saved in your Supabase `inquiries` table  
3. A **database trigger** runs automatically  
4. The trigger calls a **Supabase Edge Function**  
5. The Edge Function sends an email to **tyash1864@gmail.com** using Resend  

---

## ✅ Step-by-Step Setup

### STEP 1: Get Resend API Key (Free)

Resend is the service that sends the emails.

1. Go to [https://resend.com](https://resend.com)  
2. Sign up (free account)  
3. After login, go to **API Keys** in the sidebar  
4. Click **Create API Key**  
5. Give it a name (e.g. "Shop Smart")  
6. Choose **Full Access** (or at least **Sending access**)  
7. Click **Add**  
8. **Copy the API key** and save it somewhere safe (you won’t see it again)  

---

### STEP 2: Add Resend API Key to Supabase

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)  
2. Select your project: **shop-smart-central**  
3. In the left sidebar: **Project Settings** (gear icon)  
4. Click **Edge Functions**  
5. Find **Secrets** (or **Environment variables**)  
6. Add a new secret:  
   - **Name:** `RESEND_API_KEY`  
   - **Value:** paste your Resend API key  
7. Click **Save**  

---

### STEP 3: Get Your Supabase Anon Key

The database trigger needs this to call the Edge Function.

1. Still in Supabase Dashboard → **Project Settings**  
2. Click **API** in the left menu  
3. Find **Project API keys**  
4. Copy the **anon** **public** key (not the service_role key)  

---

### STEP 4: Set the Anon Key in Your Database

1. In Supabase Dashboard, go to **SQL Editor**  
2. Click **New query**  
3. Paste this (replace `YOUR_ANON_KEY_HERE` with the key you copied):

```sql
ALTER DATABASE postgres SET app.supabase_anon_key TO 'YOUR_ANON_KEY_HERE';
```

4. Click **Run** (or Execute)  
5. You should see success  

---

### STEP 5: Run the Database Migration

This creates the trigger and function that send the inquiry to the Edge Function.

**Option A: Using Supabase CLI**

1. Open terminal in your project folder  
2. Run:
```bash
supabase db push
```

**Option B: Using Supabase Dashboard**

1. Go to **SQL Editor**  
2. Open the file:  
   `supabase/migrations/20260215000000_add_email_notification.sql`  
3. Copy **all** the SQL from that file  
4. Paste it into the SQL Editor  
5. Click **Run**  

---

### STEP 6: Deploy the Edge Function

1. Open terminal in your project folder:
   ```
   c:\Users\Lenovo\OneDrive\Desktop\paras enterprise\shop-smart-central
   ```

2. Log in to Supabase (if not already):
   ```bash
   supabase login
   ```

3. Link your project (if not already):
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   - Replace `YOUR_PROJECT_REF` with your project ID  
   - You can find it in Supabase Dashboard → Project Settings → General → Reference ID  
   - (e.g. `eqhixgkcutopfbtbitfg` or `nduwiybhhustzhvquqjx`)  

4. Deploy the function:
   ```bash
   supabase functions deploy send-inquiry-notification
   ```

5. When asked, ensure the secret `RESEND_API_KEY` is set (from Step 2)  

---

### STEP 7: Check the Migration URL Matches Your Project

The migration file uses a hardcoded project URL. Make sure it matches your project.

1. Open: `supabase/migrations/20260215000000_add_email_notification.sql`  
2. Find this line (around line 46):
   ```sql
   url := 'https://eqhixgkcutopfbtbitfg.supabase.co/functions/v1/send-inquiry-notification',
   ```
3. Replace `eqhixgkcutopfbtbitfg` with **your** Supabase project ref (from Dashboard → Project Settings → General)  
4. If you already ran the migration, run this in SQL Editor to fix it:

```sql
-- First, recreate the function with YOUR project ref in the URL
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
        url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-inquiry-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
        ),
        body := inquiry_payload
      );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to send inquiry notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;
```

Replace `YOUR_PROJECT_REF` with your actual project ref.

---

## 🧪 Step 8: Test It

1. Run your app (e.g. `npm run dev`)  
2. Go to the home page or any product page  
3. Submit an inquiry using the Contact form:
   - Name: Test Customer  
   - Email: test@example.com  
   - Phone: 1234567890  
   - Message: This is a test inquiry  
4. Click Submit  
5. Check your inbox at **tyash1864@gmail.com**  
6. Also check **Spam** and **Promotions** if you don’t see it  

---

## ⚠️ Important Notes

### Resend “From” address

Right now the email is sent from `onboarding@resend.dev`. This is Resend’s default:

- Free accounts can **only** send to the email you used to sign up for Resend  
- To send to tyash1864@gmail.com, use **tyash1864@gmail.com** as your Resend account email  
- For production, add and verify your own domain in Resend  

### If emails don’t arrive

1. Check Resend Dashboard → Logs for delivery status  
2. Check Supabase Dashboard → Edge Functions → Logs for `send-inquiry-notification`  
3. Confirm `RESEND_API_KEY` is set in Supabase Edge Function secrets  
4. Confirm `app.supabase_anon_key` is set in the database (Step 4)  
5. Confirm the URL in the migration matches your project ref  

---

## 📋 Quick Checklist

- [ ] Resend account created  
- [ ] Resend API key created and copied  
- [ ] `RESEND_API_KEY` added in Supabase Edge Function secrets  
- [ ] Supabase anon key copied  
- [ ] `app.supabase_anon_key` set in database via SQL  
- [ ] Migration `20260215000000_add_email_notification.sql` run  
- [ ] URL in migration matches your project ref  
- [ ] Edge function `send-inquiry-notification` deployed  
- [ ] Test inquiry submitted  
- [ ] Email received at tyash1864@gmail.com  

---

## 📁 Files Involved

| File | Purpose |
|------|---------|
| `supabase/migrations/20260215000000_add_email_notification.sql` | Trigger + function that calls the Edge Function on new inquiries |
| `supabase/functions/send-inquiry-notification/index.ts` | Edge Function that sends the email via Resend to tyash1864@gmail.com |

---

## 🆘 Need Help?

- Resend docs: [https://resend.com/docs](https://resend.com/docs)  
- Supabase Edge Functions: [https://supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)  
- Supabase pg_net: [https://supabase.com/docs/guides/database/extensions/pg_net](https://supabase.com/docs/guides/database/extensions/pg_net)  
