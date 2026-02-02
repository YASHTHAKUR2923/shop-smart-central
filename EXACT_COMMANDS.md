# EXACT COMMANDS TO DEPLOY

Copy and paste these commands exactly as shown to deploy the new role system.

---

## COMMAND 1: Deploy Database Migrations

**Open PowerShell and run:**

```powershell
cd C:\Users\Lenovo\OneDrive\Desktop\shop-smart-central
supabase link --project-ref <YOUR_PROJECT_REF>
supabase db push
```

**Where to find `<YOUR_PROJECT_REF>`:**
1. Go to https://app.supabase.com
2. Select your project
3. Look at the URL: `https://app.supabase.com/project/<PROJECT_REF>`
4. Copy that part (example: `abc123xyz`)

**Example:**
```powershell
supabase link --project-ref abc123xyz
supabase db push
```

**Expected Output:**
```
✓ Migrations successfully pushed to remote database
✓ Applied 20260202000000_add_sale_and_product_manager_roles.sql
✓ Applied 20260202000001_add_role_based_rls_policies.sql
```

✅ **STOP and verify output shows ✓ before proceeding to Command 2**

---

## COMMAND 2: Start Development Server

**In the same PowerShell window, run:**

```powershell
npm run dev
```

**Expected Output:**
```
VITE v5.4.19  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

✅ **COPY the URL: http://localhost:5173/**

---

## COMMAND 3: Test in Browser

**Open your browser and:**

1. Go to: **http://localhost:5173/**
2. Sign in with your **ADMIN** account
3. Go to: **http://localhost:5173/admin/users**
4. Find any user
5. Click the **Role** dropdown (should show 4 options now)
6. Select a role: **Sales Manager**, **Product Manager**, or **Customer**
7. User's role should update immediately ✅

---

## IF MIGRATION FAILS

**If you get an error in Command 1:**

### Option A: Reinstall Supabase CLI
```powershell
npm install -g supabase@latest
supabase db push
```

### Option B: Manual Deploy via Dashboard

1. Go to https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** (left menu) → **New Query**
4. Copy entire contents of: `supabase/migrations/20260202000000_add_sale_and_product_manager_roles.sql`
5. Paste and click **Execute**
6. Click **New Query** again
7. Copy entire contents of: `supabase/migrations/20260202000001_add_role_based_rls_policies.sql`
8. Paste and click **Execute**
9. Go back to Command 2 and run `npm run dev`

---

## IF DEV SERVER FAILS

**If `npm run dev` shows errors:**

```powershell
# Clear cache and rebuild
npm run build
npm run dev
```

**If still fails:**

```powershell
# Delete node_modules and reinstall
rm -r node_modules
npm install
npm run dev
```

---

## IF ROLES DROPDOWN STILL SHOWS ONLY 2 ROLES

**Clear browser cache:**

1. Press **Ctrl + Shift + Del** (Windows)
2. Select: **All time**
3. Check: **Cookies**, **Cached images**, **Cached files**
4. Click: **Clear data**
5. Go to http://localhost:5173 and sign back in

---

## VERIFY EVERYTHING WORKED

**Checklist:**

- [ ] Migration deployed (✓ in output)
- [ ] Dev server running (green text)
- [ ] Can access http://localhost:5173/admin/users
- [ ] Dropdown shows: Admin, Sales Manager, Product Manager, Customer
- [ ] Can click dropdown and change roles
- [ ] Role changes are visible on page (badge updates)

If all checked ✅ **→ You're done! System is live.**

---

## PRODUCTION DEPLOYMENT

**When you're ready for production:**

```powershell
# Build for production
npm run build

# This creates a dist/ folder
# Upload dist/ folder to your hosting provider
# (Examples: Vercel, Netlify, GitHub Pages, etc.)

# For Vercel:
vercel deploy
```

---

## ONE-MINUTE SUMMARY

```powershell
# Step 1: Deploy database
supabase link --project-ref YOUR_REF
supabase db push

# Step 2: Start app
npm run dev

# Step 3: Test
# Open http://localhost:5173/admin/users
# Change a user's role → Should see 4 role options
```

✅ **Done! Roles are now live.**

---

## 🆘 STILL STUCK?

| Error | Solution |
|-------|----------|
| `supabase: command not found` | Run: `npm install -g supabase` |
| `Link to project first` | Run: `supabase link --project-ref YOUR_REF` |
| `ENOENT: no such file` | Run from correct folder: `cd C:\Users\Lenovo\OneDrive\Desktop\shop-smart-central` |
| `npm: command not found` | Install Node.js from nodejs.org |
| `Port 5173 already in use` | Close other apps or run: `npm run dev -- --port 3000` |

---

## EXAMPLE SESSION

Here's what it looks like when everything works:

```powershell
C:\Users\Lenovo\OneDrive\Desktop\shop-smart-central> supabase link --project-ref abc123xyz
✓ Linked to project abc123xyz

C:\Users\Lenovo\OneDrive\Desktop\shop-smart-central> supabase db push
✓ Applied migration 20260202000000_add_sale_and_product_manager_roles.sql
✓ Applied migration 20260202000001_add_role_based_rls_policies.sql

C:\Users\Lenovo\OneDrive\Desktop\shop-smart-central> npm run dev

  VITE v5.4.19  ready in 256 ms

  ➜  Local:   http://localhost:5173/
```

→ Open http://localhost:5173 → Sign in → Go to /admin/users → Test role dropdown ✅

---

**That's it! You're deployed!** 🚀
