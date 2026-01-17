# Admin Panel Access Setup

## Security Overview

The admin panel (`/admin`) is now protected with role-based access control. Only users with the `admin` role can access administrative functions.

## How to Promote a User to Admin

### Option 1: Using Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Run this SQL command (replace with your email):

```sql
SELECT promote_to_admin('your-email@example.com');
```

### Option 2: Direct Database Update

1. Go to your Supabase Dashboard
2. Navigate to Table Editor → profiles
3. Find your user profile
4. Change the `role` column from `user` to `admin`
5. Save the changes

## User Roles

- **user** (default): Regular user with no admin access
- **admin**: Full access to admin panel including:
  - Media management (images, videos)
  - Price management
  - Installation videos
  - Blog post management
  - Site settings

## Security Features

1. **Automatic Profile Creation**: New users automatically get a profile with `user` role
2. **Access Verification**: Admin panel checks user role on every load
3. **Database-Level Security**: Role checks happen at the database level
4. **Protected Routes**: Unauthorized users see an "Access Denied" page

## First-Time Setup

When setting up your site for the first time:

1. Create your admin account through the signup page
2. Use one of the methods above to promote your account to admin
3. Login and access `/admin` to verify admin access
4. You can now manage the site through the admin panel

## Troubleshooting

### "Access Denied" Error

If you're seeing the access denied page:
- Verify your user has `role = 'admin'` in the profiles table
- Make sure you're logged in with the correct account
- Check browser console for any errors

### Profile Not Found

If profile doesn't exist:
- New users should automatically get a profile
- For existing users, run: `SELECT handle_new_user()` in SQL Editor
- Or manually create profile with your user ID

## Security Best Practices

1. Only promote trusted users to admin
2. Regularly review admin user list
3. Remove admin access when no longer needed
4. Keep admin credentials secure
5. Monitor admin activity through logs
