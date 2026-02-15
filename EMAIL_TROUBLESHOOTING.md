# Email Not Working? Debug Checklist

Follow these steps to find why inquiry emails aren't arriving at tyash1864@gmail.com.

---

## 1. Add RESEND_API_KEY (most common fix)

The Edge Function **won't send emails** without this.

1. Go to [resend.com](https://resend.com) and sign up with **tyash1864@gmail.com**
2. Create an API key: **API Keys** → **Create API Key**
3. Add it to Supabase:
   - Run in terminal:
   ```bash
   npx supabase secrets set RESEND_API_KEY=re_your_key_here --project-ref eqhixgkcutopfbtbitfg
   ```
   - Or: Supabase Dashboard → **Project Settings** → **Edge Functions** → **Secrets** → Add `RESEND_API_KEY`
4. Redeploy the function:
   ```bash
   npx supabase functions deploy send-inquiry-notification
   ```

---

## 2. Check Edge Function logs

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/eqhixgkcutopfbtbitfg/functions)
2. Click **send-inquiry-notification**
3. Open **Logs** tab
4. Submit an inquiry, then refresh the logs

**Look for:**
- `Missing RESEND_API_KEY` → Add the secret (step 1)
- `Resend API Error` → Check your Resend API key and account
- `Received inquiry` → Function was called; check Resend dashboard for delivery

---

## 3. Ensure trigger exists

Run in Supabase **SQL Editor**:

```sql
SELECT tgname FROM pg_trigger WHERE tgname = 'inquiry_notification_trigger';
```

- If it returns **no rows** → Run the full migration (see step 4 below)
- If it returns 1 row → Trigger exists ✓

---

## 4. Run full migration (if trigger missing)

1. Supabase Dashboard → **SQL Editor**
2. Copy ALL content from: `supabase/migrations/20260215000000_add_email_notification.sql`
3. Paste and **Run**

This creates:
- `pg_net` extension
- `send_inquiry_notification` function
- `inquiry_notification_trigger` on `inquiries` table

---

## 5. Test Edge Function directly

Call the function manually to see if Resend works.

**Option A – Browser console**

1. Open your app: http://localhost:5173
2. Press **F12** → **Console** tab
3. Paste and run:

```javascript
fetch('https://eqhixgkcutopfbtbitfg.supabase.co/functions/v1/send-inquiry-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'test-123',
    customer_name: 'Test User',
    customer_email: 'test@example.com',
    customer_phone: '9876543210',
    product_id: null,
    message: 'Direct test from browser',
    status: 'pending',
    created_at: new Date().toISOString()
  })
}).then(r => r.json()).then(console.log);
```

4. Check response:
   - `{ success: true, id: "..." }` → Email sent; check tyash1864@gmail.com (and spam)
   - `{ error: "Email service not configured" }` → Add RESEND_API_KEY
   - `{ error: "..." }` → Check the message and Resend dashboard

**Option B – curl**

```bash
curl -X POST "https://eqhixgkcutopfbtbitfg.supabase.co/functions/v1/send-inquiry-notification" -H "Content-Type: application/json" -d "{\"id\":\"test-123\",\"customer_name\":\"Test User\",\"customer_email\":\"test@example.com\",\"customer_phone\":\"9876543210\",\"product_id\":null,\"message\":\"Direct test\",\"status\":\"pending\",\"created_at\":\"2025-01-01T00:00:00Z\"}"
```

---

## 6. Resend free tier rules

- You can only send **to** the email you signed up with.
- Use **tyash1864@gmail.com** when creating the Resend account.
- Check Resend dashboard: [resend.com/emails](https://resend.com/emails) for delivery status.

---

## 7. Check spam and promotions

Check:
- Spam
- Promotions (Gmail)
- All Mail
- Filters / blocked senders

---

## Quick checklist

- [ ] Resend account created with tyash1864@gmail.com
- [ ] RESEND_API_KEY created in Resend
- [ ] RESEND_API_KEY added in Supabase (secrets)
- [ ] Function redeployed after adding secret
- [ ] Trigger exists (SQL check)
- [ ] Direct test returns `success: true`
- [ ] Checked spam/promotions
