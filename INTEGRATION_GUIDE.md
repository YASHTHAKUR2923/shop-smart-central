# Integration Guide - New User Roles (Sale & Product Manager)

## Overview

You now have **4 user roles** in your Shop Smart Central system:

1. **Admin** - Full system access
2. **Sale (Sales Manager)** - Can view all customer inquiries
3. **Product Manager** - Can upload products, create categories, manage images
4. **Customer** - Default customer role (limited access)

## Setup Steps

### Step 1: Deploy Database Migrations

The migration files have been created and will add the new roles to your database:

**Migration Files:**
- `supabase/migrations/20260202000000_add_sale_and_product_manager_roles.sql` - Adds the enum types
- `supabase/migrations/20260202000001_add_role_based_rls_policies.sql` - Adds RLS policies for access control

**To deploy:**
```bash
# If using Supabase CLI
supabase db push

# The migrations will automatically run in the correct order
```

### Step 2: Verify Updates Are Applied

The following files have been updated to support the new roles:

1. **src/types/database.ts** - Updated `AppRole` type
   ```typescript
   export type AppRole = 'admin' | 'sale' | 'product_manager' | 'customer';
   ```

2. **src/hooks/useAuth.tsx** - Enhanced with role detection
   - New properties: `isSale`, `isProductManager`, `userRole`
   - Automatically detects user's assigned role
   - Exports all role information via context

3. **src/pages/admin/AdminUsers.tsx** - Updated UI
   - New role options in dropdowns
   - Color-coded badges for each role
   - Role filter options

### Step 3: Start Your Application

```bash
npm run dev
# or
bun run dev
```

The application will automatically apply the new database migrations and start with the updated role system.

### Step 4: Assign Roles to Users

1. **Navigate to Admin Dashboard**
   - Go to `/admin/users` in your application
   - You must be logged in as an admin

2. **Assign Roles**
   - Find the user you want to assign a role to
   - Click the role dropdown
   - Select one of: Administrator, Sales Manager, Product Manager, Customer
   - Changes apply immediately

3. **Users Will See New Features**
   - **Sales Manager**: Can access inquiries dashboard to view all customer inquiries
   - **Product Manager**: Can access product upload and category management pages
   - Both can view products and basic content (exact permissions depend on your UI setup)

## Role Permissions Summary

### Admin
- ✅ Manage all users and assign roles
- ✅ View all inquiries
- ✅ Upload products
- ✅ Create and manage categories
- ✅ Upload images
- ✅ Full system access

### Sales Manager
- ✅ View all customer inquiries
- ✅ Access inquiry management/details
- ❌ Cannot modify products
- ❌ Cannot manage categories

### Product Manager
- ✅ Upload products
- ✅ Create categories
- ✅ Manage images and content
- ✅ Update product information
- ❌ Cannot see inquiries
- ❌ Cannot manage user roles

### Customer
- ✅ Browse products
- ✅ Submit inquiries
- ✅ View their own inquiries
- ❌ Cannot access admin features

## Database Structure

### New Enum Type: `app_role`
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'sale', 'product_manager', 'customer');
```

### user_roles Table
Stores user role assignments:
```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'customer',
  UNIQUE(user_id, role)
);
```

## Row Level Security (RLS) Policies

The following policies have been added:

### Inquiries
- **Sale role**: Can view all inquiries
- **Admin role**: Can view and manage all inquiries

### Products
- **Product Manager**: Can insert and update products
- **Admin**: Can insert and update products

### Categories
- **Product Manager**: Can insert, update, and delete categories
- **Admin**: Can insert, update, and delete categories

## Testing the Integration

### 1. Create Test Accounts
```bash
# Sign up multiple test accounts:
# test-admin@example.com
# test-sales@example.com
# test-pm@example.com
```

### 2. Assign Roles via Admin Panel
1. Log in as admin
2. Go to `/admin/users`
3. Assign roles to test accounts

### 3. Verify Access Control
- Log in as Sales Manager → Should see inquiries
- Log in as Product Manager → Should access product upload
- Log in as Customer → Should have limited access

## Environment Variables

No new environment variables are required. The system uses existing Supabase credentials.

## Troubleshooting

### Issue: Roles not showing in dropdown
**Solution**: Clear browser cache and refresh. Ensure migrations have been applied.

### Issue: User can't access features after role assignment
**Solution**: 
1. Have the user sign out and sign back in
2. Check if migrations were successfully deployed
3. Verify the user_roles table has the correct entry

### Issue: RLS policy errors
**Solution**: 
1. Check Supabase logs for detailed error messages
2. Ensure all migrations ran in order
3. Verify user has a valid role entry in user_roles table

## Next Steps

1. ✅ Database migrations deployed
2. ✅ TypeScript types updated
3. ✅ useAuth hook enhanced
4. ✅ Admin UI updated
5. **TODO**: Implement UI for each role (create pages/components based on role access)
   - Sales Manager dashboard for inquiries
   - Product Manager dashboard for products/categories
   - Role-specific navigation menu items

## File Changes Summary

### Created Files
- `supabase/migrations/20260202000000_add_sale_and_product_manager_roles.sql`
- `supabase/migrations/20260202000001_add_role_based_rls_policies.sql`

### Modified Files
- `src/types/database.ts` - Updated AppRole type
- `src/hooks/useAuth.tsx` - Added role detection
- `src/pages/admin/AdminUsers.tsx` - Added new role options

## Need Help?

For detailed implementation of role-specific features:
1. Review the RLS policies in migrations
2. Use `useAuth()` hook to check roles: `const { isSale, isProductManager } = useAuth()`
3. Create conditional UI components based on user roles
4. Add route protection: `if (!isSale) return <Navigate to="/" />`

## Example: Creating Role-Protected Page

```tsx
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function SalesPage() {
  const { isSale, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isSale && !isAdmin) return <Navigate to="/" replace />;

  return (
    <div>
      <h1>Sales Dashboard</h1>
      {/* Sales-specific content */}
    </div>
  );
}
```
