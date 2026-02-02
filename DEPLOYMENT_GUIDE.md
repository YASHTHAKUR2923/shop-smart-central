# Complete Deployment Guide: New User Roles (Sale & Product Manager)

## Overview
This guide walks you through deploying the new role-based access system for your Shop Smart Central application.

---

## STEP 1: Verify All Files Are Updated

### ✅ Check Database Type Definition
File: `src/types/database.ts` (Line 4)
```typescript
export type AppRole = 'admin' | 'sale' | 'product_manager' | 'customer';
```

### ✅ Check Authentication Hook
File: `src/hooks/useAuth.tsx`
- Should have `isSale`, `isProductManager`, and `userRole` properties
- Should detect user role from database automatically

### ✅ Check Admin UI
File: `src/pages/admin/AdminUsers.tsx`
- Should have all 4 role options in dropdowns
- Should have color-coded role badges

---

## STEP 2: Deploy Database Migrations

### 2.1 Using Supabase CLI (Recommended)

**Prerequisites:**
- Install Supabase CLI: `npm install -g supabase`
- Have Supabase project credentials ready

**Deploy Migrations:**

```powershell
# Navigate to your project
cd C:\Users\Lenovo\OneDrive\Desktop\shop-smart-central

# Initialize Supabase (if not already done)
supabase init

# Link to your Supabase project
supabase link --project-ref <your-project-ref>
# (Find your project ref on supabase.com dashboard)

# Push migrations to your database
supabase db push
```

**Expected Output:**
```
✓ Migrations successfully pushed to remote database
✓ Migration 20260202000000_add_sale_and_product_manager_roles.sql applied
✓ Migration 20260202000001_add_role_based_rls_policies.sql applied
```

### 2.2 Manual Deployment (If Supabase CLI fails)

**Option A: Via Supabase Dashboard**

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor** → Click **New Query**
4. Copy content from `supabase/migrations/20260202000000_add_sale_and_product_manager_roles.sql`
5. Execute the query
6. Repeat for `20260202000001_add_role_based_rls_policies.sql`

**Option B: Via Direct Database Connection**

```powershell
# Using psql (if installed)
psql "postgresql://[user]:[password]@[host]:[port]/[database]" < supabase/migrations/20260202000000_add_sale_and_product_manager_roles.sql
psql "postgresql://[user]:[password]@[host]:[port]/[database]" < supabase/migrations/20260202000001_add_role_based_rls_policies.sql
```

---

## STEP 3: Verify Database Changes

### 3.1 Verify Enum Type Was Created

In Supabase SQL Editor, run:
```sql
-- Check if app_role enum includes new values
SELECT enum_range(NULL::app_role);
```

**Expected result:**
```
{admin,sale,product_manager,customer}
```

### 3.2 Verify RLS Policies Were Created

In Supabase SQL Editor, run:
```sql
-- Check policies on inquiries table
SELECT policyname, cmd, qual FROM pg_policies 
WHERE tablename = 'inquiries';
```

**Expected result:**
```
Sale can view all inquiries
Admin can view all inquiries
```

---

## STEP 4: Update Application Code

### 4.1 Rebuild TypeScript

```powershell
cd C:\Users\Lenovo\OneDrive\Desktop\shop-smart-central
npm run build
```

**Expected output:**
```
✓ 2489 modules transformed.
✓ built in 10.13s
```

### 4.2 Start Development Server

```powershell
npm run dev
```

**Expected output:**
```
VITE v5.4.19  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## STEP 5: Test Role Assignment

### 5.1 Log in as Admin
1. Open browser: `http://localhost:5173`
2. Sign in with your admin account
3. Navigate to `/admin/users`

### 5.2 Create Test User Accounts
Create accounts for testing (or use existing accounts):
- `test-sales@example.com` → Assign **Sales Manager** role
- `test-pm@example.com` → Assign **Product Manager** role

### 5.3 Assign Roles
1. In Admin Users page (`/admin/users`)
2. Find a user
3. Click the role dropdown
4. Select new role (Sales Manager, Product Manager, or Customer)
5. Role changes immediately ✅

---

## STEP 6: Verify Access Control Works

### Test 1: Sales Manager Access
```
1. Sign in as Sales Manager account
2. Try accessing: /admin/inquiries or /admin/users
3. Should see inquiries data
4. Should NOT see product management
```

### Test 2: Product Manager Access
```
1. Sign in as Product Manager account
2. Try accessing: /admin/products or /admin/categories
3. Should see product upload form
4. Should NOT see inquiries
5. Should NOT see user management
```

### Test 3: Customer Access
```
1. Sign in as customer account
2. Try accessing any /admin/* page
3. Should be redirected to home page
4. Should only see products and inquiry form
```

---

## STEP 7: Production Deployment

### 7.1 Build for Production
```powershell
npm run build
```

### 7.2 Deploy to Your Hosting
```powershell
# Copy dist/ folder to your hosting provider
# (Vercel, Netlify, AWS, etc.)

# Or deploy with your preferred method
# Example: Vercel
vercel deploy
```

### 7.3 Verify Production
1. Visit your production URL
2. Test role assignment in admin panel
3. Test access control for each role

---

## TROUBLESHOOTING

### Problem: "Roles not showing in dropdown"
**Solution:**
```powershell
# 1. Clear browser cache and reload
# 2. Rebuild the project
npm run build

# 3. Restart dev server
npm run dev

# 4. Check if migrations were applied
# Run in Supabase SQL Editor:
SELECT * FROM user_roles LIMIT 1;
```

### Problem: "Role changes don't take effect"
**Solution:**
1. User must sign out and sign back in
2. Check browser localStorage
3. Run: `localStorage.clear()` in browser console
4. Refresh and sign back in

### Problem: "RLS policy error when accessing data"
**Solution:**
```sql
-- In Supabase SQL Editor, verify policies exist:
SELECT policyname, cmd FROM pg_policies WHERE tablename IN ('inquiries', 'products', 'custom_categories');

-- If missing, run migration again:
-- (Copy and paste content from migration files)
```

### Problem: "Database migration failed"
**Solution:**
```powershell
# Check Supabase logs
supabase functions logs

# Rollback (if available)
supabase db pull  # Get latest state

# Or manually check migration file syntax:
# Open migration files in supabase/migrations/
# Look for SQL syntax errors
```

### Problem: "TypeScript errors after deployment"
**Solution:**
```powershell
# Clear TypeScript cache
npm run build
npm run dev

# Or restart VS Code
# Press Ctrl+Shift+P → Reload Window
```

---

## File Changes Applied

### Created Files:
```
✓ supabase/migrations/20260202000000_add_sale_and_product_manager_roles.sql
✓ supabase/migrations/20260202000001_add_role_based_rls_policies.sql
✓ INTEGRATION_GUIDE.md
```

### Modified Files:
```
✓ src/types/database.ts (Added 'sale' and 'product_manager' roles)
✓ src/hooks/useAuth.tsx (Added role detection)
✓ src/pages/admin/AdminUsers.tsx (Added role options in UI)
```

---

## Quick Reference Checklist

- [ ] Database migrations deployed (`supabase db push`)
- [ ] New enum type verified in database
- [ ] RLS policies created in database
- [ ] Application rebuilt (`npm run build`)
- [ ] Development server running (`npm run dev`)
- [ ] Test admin can log in
- [ ] Can access Admin Users page (`/admin/users`)
- [ ] Can assign roles to users
- [ ] Users see new features after role assignment
- [ ] Test Sales Manager access to inquiries
- [ ] Test Product Manager access to products
- [ ] Test Customer limited access

---

## Next Steps After Deployment

1. **Create role-specific dashboards:**
   - `/admin/sales` - Sales Manager dashboard
   - `/admin/products` - Product Manager dashboard

2. **Add navigation menu items based on roles:**
   - Show/hide menu items based on `isSale`, `isProductManager`

3. **Implement additional features:**
   - Inquiry assignment to sales team
   - Product approval workflow for content team
   - Role-based reporting

4. **Monitor and maintain:**
   - Check Supabase logs regularly
   - Review RLS policy performance
   - Track user access patterns

---

## Support Resources

- Supabase Documentation: https://supabase.com/docs
- PostgreSQL Enum Types: https://www.postgresql.org/docs/current/datatype-enum.html
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security
- React Context API: https://react.dev/reference/react/useContext

---

## Questions?

For each role-based feature:
1. Use the `useAuth()` hook to get `isSale`, `isProductManager`, `isAdmin`
2. Check RLS policies in migration files
3. Add UI guards: `if (!isSale) return <Navigate to="/" />`
4. Test with multiple accounts

Good luck with your deployment! 🚀
