# Supabase RLS Configuration Instructions

## Overview

This document provides instructions for configuring Row Level Security (RLS) policies for the manga website admin system.

## Admin User Details

- **Email**: cheahboolim@gmail.com
- **User ID**: 0fb5f13b-bd1e-417a-9a75-add077e54451

## RLS Configuration Steps

### 1. Access Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor

### 2. Execute RLS Migration

Copy and paste the SQL from `supabase/migrations/001_enable_rls_and_admin_policies.sql` into the SQL Editor and execute it.

This will:

- Enable RLS on all tables
- Create admin policies for full access (INSERT, UPDATE, DELETE, SELECT)
- Create public read policies for visitors (SELECT only)
- Grant appropriate permissions

### 3. Verify Configuration

After running the migration, verify that:

1. All tables have RLS enabled
2. Admin user can perform all operations when authenticated
3. Anonymous users can only read data
4. Authenticated non-admin users can only read data

### 4. Test Admin Access

1. Log in to the admin dashboard at `/boleng-admin`
2. Try accessing manga and tag management
3. Verify that all CRUD operations work correctly

## Security Benefits

- **Data Protection**: Only admin can modify content
- **Public Access**: Visitors can still browse content
- **Authentication Required**: Admin operations require valid session
- **Granular Control**: Each table has specific policies

## Troubleshooting

If you encounter issues:

1. Check that the admin user UUID is correct
2. Verify RLS policies are active
3. Ensure admin user is properly authenticated
4. Check Supabase logs for any policy violations

## Notes

- The admin dashboard will only work properly after RLS is configured
- TypeScript errors about database access will be resolved once policies are active
- The system maintains public read access for all visitor-facing features
