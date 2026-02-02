# 📊 DEPLOYMENT OVERVIEW & ARCHITECTURE

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHOP SMART CENTRAL                            │
│                   Role-Based Access System                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  useAuth() Hook                                                   │
│  ├─ isAdmin: boolean          ← Current user is Admin?           │
│  ├─ isSale: boolean           ← Current user is Sales Manager?   │
│  ├─ isProductManager: boolean ← Current user is Product Manager? │
│  ├─ userRole: AppRole         ← User's actual role               │
│  └─ user: User                ← Supabase user object             │
│                                                                   │
│  Components Using Roles:                                         │
│  ├─ AdminUsers.tsx      (Role assignment dropdown)              │
│  ├─ [Future] SalesDash   (Sales Manager only)                   │
│  ├─ [Future] ProductDash (Product Manager only)                 │
│  └─ [Future] RoleGuards  (Route protection)                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                     API Layer (Supabase)
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Supabase)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Authentication (auth.users)                                    │
│  ├─ id: UUID                                                    │
│  ├─ email: string                                               │
│  └─ created_at: timestamp                                       │
│           ↓                                                       │
│  Profiles (public.profiles)                                     │
│  ├─ user_id: UUID (FK to auth.users)                           │
│  ├─ full_name: string                                           │
│  └─ company_name: string                                        │
│           ↓                                                       │
│  User Roles (public.user_roles) ⭐ NEW                          │
│  ├─ user_id: UUID (FK to auth.users)                           │
│  ├─ role: app_role enum ⭐ NEW                                  │
│  │  └─ Values: admin | sale | product_manager | customer       │
│  └─ UNIQUE(user_id, role)                                      │
│           ↓                                                       │
│  Tables with RLS Policies:                                      │
│  ├─ inquiries      (Sale role can view)                         │
│  ├─ products       (Product Manager can insert/update)          │
│  ├─ categories     (Product Manager can manage)                 │
│  └─ quotations     (Admin can manage)                           │
│                                                                   │
│  Row Level Security (RLS)                                       │
│  ├─ Checks user role from user_roles table                     │
│  ├─ Enforces access at database level                          │
│  ├─ Cannot be bypassed from frontend                           │
│  └─ Applied to all protected tables                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Role Assignment

```
Admin User                           System
    │                                  │
    ├─→ Goes to /admin/users           │
    │                                  │
    ├─→ Clicks user row                │
    │                                  │
    ├─→ Opens role dropdown            │
    │   (Shows: Admin, Sale, PM, Customer)
    │                                  │
    ├─→ Selects "Sales Manager"        │
    │                                  │
    ├─→ updateRole.mutateAsync()       │
    │   (Calls Supabase)               │
    │                                  │
    └─→                                │
        │                              │
        │                         UPDATE user_roles
        │                         SET role = 'sale'
        │                         WHERE user_id = xyz
        │                              │
        │                ✅ Role updated in database
        │                              │
    ←─────────────────────────────────┤
    │                                  │
    ├─→ UI badge updates immediately  │
    │   Shows "Sales Manager" badge    │
    │                                  │
    └─→ User sees new role             │
```

---

## Data Flow: User Login with Role Check

```
User (test-sales@example.com)         System
    │                                  │
    ├─→ Enters email/password          │
    │                                  │
    ├─→ Clicks Sign In                 │
    │                                  │
    │                              supabase.auth
    │                             .signInWithPassword()
    │                                  │
    │                            ✅ Auth successful
    │                                  │
    ├─→                                │
    │                              onAuthStateChange()
    │                              triggers
    │                                  │
    ├─→                                │
    │                          checkUserRole(userId)
    │                          SELECT role FROM user_roles
    │                          WHERE user_id = userId
    │                                  │
    │                ✅ Query returns: role='sale'
    │                                  │
    ├─→                                │
    │                          setIsSale(true)
    │                          setUserRole('sale')
    │                          setIsAdmin(false)
    │                          setIsProductManager(false)
    │                                  │
    ├─→ useAuth() now returns:         │
    │   {                              │
    │     isSale: true ✅              │
    │     isAdmin: false               │
    │     isProductManager: false      │
    │     userRole: 'sale'             │
    │   }                              │
    │                                  │
    ├─→ Components render based on:    │
    │   {isSale && <InquiriesDash />}  │
    │                                  │
    └─→ Sales Manager sees             │
        Inquiries dashboard            │
```

---

## Access Control: RLS Policy Check

```
Sales Manager (role='sale')           Supabase Database
    │                                  │
    ├─→ Requests inquiries             │
    │   SELECT * FROM inquiries        │
    │                                  │
    │                          RLS Policy Check:
    │                          ┌──────────────────┐
    │                          │ Is user 'sale'?  │
    │                          │ OR 'admin'?      │
    │                          └──────────────────┘
    │                                  │
    │                          ✅ YES - Allow query
    │                                  │
    ├─→                                │
    │                          Returns inquiries
    │                          (user can see them)
    │                                  │
    └─→ Sales Manager sees all         │
        inquiries                       │


Product Manager (role='product_manager')  Supabase Database
    │                                  │
    ├─→ Requests inquiries             │
    │   SELECT * FROM inquiries        │
    │                                  │
    │                          RLS Policy Check:
    │                          ┌──────────────────┐
    │                          │ Is user 'sale'?  │
    │                          │ OR 'admin'?      │
    │                          └──────────────────┘
    │                                  │
    │                          ❌ NO - Block query
    │                                  │
    ├─→                                │
    │                          Returns empty/error
    │                          (policy blocks access)
    │                                  │
    └─→ Product Manager gets           │
        no inquiries (forbidden)        │
```

---

## Files & Components Structure

```
Shop Smart Central/
│
├─ supabase/
│  ├─ migrations/
│  │  ├─ 20260202000000_add_sale_and_product_manager_roles.sql ⭐ NEW
│  │  │  └─ Creates app_role enum with 4 values
│  │  │
│  │  └─ 20260202000001_add_role_based_rls_policies.sql ⭐ NEW
│  │     └─ Creates RLS policies for each role
│  │
│  └─ ... (existing files)
│
├─ src/
│  ├─ types/
│  │  └─ database.ts ⭐ UPDATED
│  │     └─ AppRole = 'admin' | 'sale' | 'product_manager' | 'customer'
│  │
│  ├─ hooks/
│  │  └─ useAuth.tsx ⭐ UPDATED
│  │     ├─ isSale: boolean
│  │     ├─ isProductManager: boolean
│  │     ├─ userRole: AppRole | null
│  │     └─ checkUserRole(userId) function
│  │
│  ├─ pages/
│  │  └─ admin/
│  │     └─ AdminUsers.tsx ⭐ UPDATED
│  │        └─ Role dropdown with 4 options
│  │
│  ├─ components/
│  │  ├─ (future) SalesDashboard.tsx
│  │  ├─ (future) ProductManagerDashboard.tsx
│  │  └─ (future) RoleGuard.tsx
│  │
│  └─ ... (existing files)
│
├─ QUICK_START.md ⭐ NEW
├─ DEPLOYMENT_GUIDE.md ⭐ NEW
├─ INTEGRATION_GUIDE.md ⭐ NEW
├─ DEPLOYMENT_SUMMARY.md ⭐ NEW
├─ EXACT_COMMANDS.md ⭐ NEW
└─ ... (existing files)
```

---

## State Management Flow

```
┌────────────────────────────────────────────────────────────┐
│ AuthProvider Component (useAuth.tsx)                       │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ useState:                                                  │
│  - user: User | null           (from Supabase auth)       │
│  - session: Session | null     (from Supabase auth)       │
│  - isLoading: boolean          (app loading)              │
│  - isAdmin: boolean            ⭐ NEW                      │
│  - isSale: boolean             ⭐ NEW                      │
│  - isProductManager: boolean   ⭐ NEW                      │
│  - userRole: AppRole | null    ⭐ NEW                      │
│                                                             │
│ useEffect:                                                 │
│  1. Listen for auth state changes                         │
│  2. Check current session on mount                        │
│  3. Call checkUserRole(userId) for each                  │
│                                                             │
│ checkUserRole(userId):                                     │
│  1. Query user_roles table                                │
│  2. Get role from DB                                      │
│  3. Set isSale, isProductManager, etc.                   │
│  4. Update userRole state                                │
│                                                             │
│ Context.Provider:                                         │
│  Provides to all children via useAuth() hook             │
│                                                             │
└────────────────────────────────────────────────────────────┘
                            ↓
        Any component can use: const { isSale, isAdmin, userRole } = useAuth()
```

---

## Deployment Sequence

```
Day 1: Development
│
├─ ✅ Database migrations created
├─ ✅ TypeScript types updated
├─ ✅ useAuth hook enhanced
├─ ✅ Admin UI updated
└─ ✅ Application builds successfully
    
Day 2: Staging/Testing
│
├─ ✅ Deploy migrations to Supabase staging
├─ ✅ Test with multiple user accounts
├─ ✅ Verify RLS policies work
├─ ✅ Verify role dropdown works
└─ ✅ Verify access control works
    
Day 3: Production
│
├─ ✅ Deploy migrations to Supabase production
├─ ✅ Start production app
├─ ✅ Assign roles to team members
├─ ✅ Monitor access logs
└─ ✅ System live! 🎉
```

---

## Role Decision Matrix

```
                Admin    Sales    PM      Customer
GET /inquiries   ✅      ✅       ❌      ❌
GET /products    ✅      ✅       ✅      ✅
POST /products   ✅      ❌       ✅      ❌
GET /users       ✅      ❌       ❌      ❌
POST /roles      ✅      ❌       ❌      ❌
GET /categories  ✅      ❌       ✅      ✅
POST /categories ✅      ❌       ✅      ❌

Decision: Based on RLS Policies in Supabase
         Enforced at DATABASE LEVEL
         Cannot be bypassed from frontend
```

---

## Key Concepts

### 1. **Authentication vs Authorization**
- **Authentication**: Who are you? (username/password)
- **Authorization**: What can you do? (roles/permissions)

This system implements **Authorization** via roles.

### 2. **Row Level Security (RLS)**
- Database enforces access control
- Policies check user's role automatically
- Much more secure than frontend checks

### 3. **Role Enum**
```sql
CREATE TYPE app_role AS ENUM (
  'admin',
  'sale',
  'product_manager',
  'customer'
);
```
- Strict type checking at database level
- Cannot assign invalid roles
- Clean, predictable values

### 4. **useAuth() Hook**
```tsx
const { isSale, isProductManager, isAdmin, userRole } = useAuth();
```
- Centralized role state
- Automatic role detection on login
- Works throughout entire app

---

## Security Layers

```
Layer 1: Frontend (JavaScript)
├─ useAuth() hook provides role info
├─ Components conditionally render
└─ Routes can be protected

Layer 2: Database (Supabase RLS)
├─ RLS policies check every query
├─ Cannot be bypassed from frontend
├─ Enforced at PostgreSQL level
└─ Logged for audit trail

Layer 3: API (Functions - if you add)
├─ Server-side role checks
├─ Validate role on every request
└─ Never trust client-side only

Layer 4: Business Logic
├─ Approve workflows by role
├─ Assign tasks by role
└─ Report access by role
```

---

## Testing Checklist

```
✅ Deployment Phase:
   - [ ] Migrations deployed
   - [ ] No database errors
   - [ ] App builds successfully
   - [ ] Dev server starts

✅ Role Assignment Phase:
   - [ ] Can access /admin/users
   - [ ] Dropdown shows 4 roles
   - [ ] Can assign role to user
   - [ ] Role updates immediately

✅ Access Control Phase:
   - [ ] Admin user can do everything
   - [ ] Sales user sees inquiries
   - [ ] PM user sees products
   - [ ] Customer limited access
   - [ ] Each cannot access other areas

✅ Security Phase:
   - [ ] Logout and login required
   - [ ] RLS blocks unauthorized queries
   - [ ] No console errors
   - [ ] All features work
```

---

This completes your role-based access system! 🚀
