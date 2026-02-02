# QUICK START: Deploy New Roles in 5 Minutes

## What's New?
You now have **4 user roles**:
- **Admin** → Full access
- **Sales Manager** → View inquiries
- **Product Manager** → Manage products & categories
- **Customer** → Browse & submit inquiries

---

## DEPLOY IN 3 STEPS

### ✅ STEP 1: Push Database Changes (1 min)

```powershell
cd C:\Users\Lenovo\OneDrive\Desktop\shop-smart-central

# Option A: Using Supabase CLI (Recommended)
supabase db push

# Option B: Manual - Go to Supabase Dashboard
# 1. Go to app.supabase.com → Your Project
# 2. SQL Editor → New Query
# 3. Copy-paste from: supabase/migrations/20260202000000_add_sale_and_product_manager_roles.sql
# 4. Execute
# 5. Repeat with: supabase/migrations/20260202000001_add_role_based_rls_policies.sql
```

✅ **Done!** Your database now supports the new roles.

---

### ✅ STEP 2: Start Your App (1 min)

```powershell
npm run dev
```

**Wait for:**
```
✓ VITE ready at http://localhost:5173
```

✅ **Done!** Your app is running with the new role system.

---

### ✅ STEP 3: Assign Roles to Users (1 min)

1. Open browser: **http://localhost:5173**
2. Sign in as **ADMIN**
3. Go to: **http://localhost:5173/admin/users**
4. Find a user
5. Click role dropdown
6. Select role: **Sales Manager**, **Product Manager**, or **Customer**

✅ **Done!** Roles are now assigned.

---

## TEST IT (2 min)

### Test Sales Manager
```
1. Sign out
2. Sign in as Sales Manager account
3. You should see: Inquiries access
4. You should NOT see: Product management
```

### Test Product Manager
```
1. Sign out
2. Sign in as Product Manager account
3. You should see: Product upload, Categories
4. You should NOT see: Inquiries, User management
```

---

## 🎉 DONE!

Your Shop Smart Central now has role-based access control!

---

## NEED HELP?

| Issue | Solution |
|-------|----------|
| Roles don't show in dropdown | Clear browser cache: `Ctrl+Shift+Del` → Clear cache |
| Role doesn't take effect | User must sign out and back in |
| Database error | Check Supabase logs on dashboard |
| Can't access /admin/users | Make sure you're logged in as ADMIN |

---

## FILES CHANGED

✓ `src/types/database.ts` - Role types updated  
✓ `src/hooks/useAuth.tsx` - Role detection added  
✓ `src/pages/admin/AdminUsers.tsx` - UI updated  
✓ Migrations added to `supabase/migrations/`

---

## WHAT EACH ROLE CAN DO

### Admin ✅
- Manage users and roles
- View inquiries
- Upload products
- Create categories
- Full system access

### Sales Manager ✅
- View ALL inquiries
- See customer details

### Product Manager ✅
- Upload products
- Create categories
- Manage images
- Update product info

### Customer ✅
- Browse products
- Submit inquiries
- View own inquiries

---

## DETAILED GUIDES

📖 Full integration details: See `INTEGRATION_GUIDE.md`  
📖 Complete deployment steps: See `DEPLOYMENT_GUIDE.md`

---

**That's it! You're all set.** 🚀
