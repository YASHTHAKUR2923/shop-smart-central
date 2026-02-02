# ⚡ Telegram Integration Quick Setup (10 minutes)

## 3-Step Quick Setup

### ✅ STEP 1: Get Telegram Credentials (5 min)

**Get Bot Token:**
1. Open Telegram
2. Search: `@BotFather`
3. Send: `/newbot`
4. Create bot: `Shop Smart Central Bot`
5. Copy bot token: `123456789:ABCdef...` ← **Save this!**

**Get Channel ID:**
1. Create Telegram channel: `Shop Smart Inquiries`
2. Add your bot as admin
3. Get channel ID: `-100123456789` ← **Save this!**

---

### ✅ STEP 2: Add to Supabase (3 min)

**Go to:** https://app.supabase.com/project/eqhixgkcutopfbtbitfg

**Add secrets:**
1. Settings → Secrets
2. Add `TELEGRAM_BOT_TOKEN` = `your_bot_token`
3. Add `TELEGRAM_CHANNEL_ID` = `your_channel_id`

---

### ✅ STEP 3: Deploy Code (2 min)

**Everything is already created!** Just verify:
1. ✅ Edge Function: `send-inquiry-to-telegram` (deployed)
2. ✅ Database Trigger: `inquiry_to_telegram_trigger` (deployed)
3. ✅ Migration: `20260202000002_add_telegram_integration.sql` (ready)

---

## 🧪 Test It

1. Open app: http://localhost:5173
2. Submit an inquiry
3. Check Telegram channel → Message should appear! ✅

---

## Files Created

```
✅ supabase/functions/send-inquiry-to-telegram/index.ts
✅ supabase/migrations/20260202000002_add_telegram_integration.sql
✅ TELEGRAM_SETUP_GUIDE.md (detailed guide)
✅ TELEGRAM_QUICK_SETUP.md (this file)
```

---

## 📞 Need Help?

See: **TELEGRAM_SETUP_GUIDE.md** for detailed instructions

**Status**: 🟢 Ready to Deploy
