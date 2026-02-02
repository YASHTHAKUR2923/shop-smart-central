# ✅ TELEGRAM CONFIGURATION ADDED

## Your Credentials

- **Bot Token**: 8499568899:AAHWEvUjpRrg48I9H1q8eQM0GoOW6F765y0
- **Channel ID**: -1008520138930

## Next Steps

1. **Deploy Edge Function to Supabase**
   - Go to: https://app.supabase.com/project/eqhixgkcutopfbtbitfg
   - Functions → Create Function → send-inquiry-to-telegram
   - Copy code from: supabase/functions/send-inquiry-to-telegram/index.ts
   - Deploy

2. **Add Secrets to Supabase**
   - Settings → Secrets
   - Add: TELEGRAM_BOT_TOKEN = 8499568899:AAHWEvUjpRrg48I9H1q8eQM0GoOW6F765y0
   - Add: TELEGRAM_CHANNEL_ID = -1008520138930

3. **Deploy Database Trigger**
   - SQL Editor → New Query
   - Copy from: supabase/migrations/20260202000002_add_telegram_integration.sql
   - Execute

4. **Test**
   - Go to app: http://localhost:5173
   - Submit an inquiry
   - Check Telegram channel for message

## Credentials for Reference

Use these when configuring Supabase:
- TELEGRAM_BOT_TOKEN=8499568899:AAHWEvUjpRrg48I9H1q8eQM0GoOW6F765y0
- TELEGRAM_CHANNEL_ID=-1008520138930
