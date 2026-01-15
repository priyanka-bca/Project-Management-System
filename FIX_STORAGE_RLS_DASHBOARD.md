# Fix Storage RLS - Using Dashboard

Since you can't modify storage.objects via SQL, use the Supabase dashboard instead.

## Steps to Fix (Using Dashboard)

### Option 1: Disable RLS on Storage Objects (Recommended for Testing)

1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. Look for **storage.objects** table
3. Click on it
4. Find the **"Enable RLS"** toggle
5. **Turn it OFF** (disable RLS)
6. Done!

### Option 2: Create a Policy (If You Want RLS Enabled)

1. Go to **Authentication** → **Policies**
2. Click **storage.objects**
3. Click **"New Policy"**
4. Choose **"For INSERT"**
5. Set the policy:
   - Name: `Allow authenticated uploads`
   - With Check: `auth.role() = 'authenticated'`
6. Click **Save**
7. Create another for UPDATE with same settings

### Option 3: Check Bucket Settings

1. Go to **Storage** → **task-submissions** bucket
2. Click the **three dots** menu
3. Click **Edit bucket**
4. Make sure **Public** is toggled **ON**
5. Save

## Then Test Again

After making changes, go back to Flutter and try uploading.

If you're still getting errors, also try adding this to your upload code for better debugging.

## Why This Happened

Supabase storage uses RLS (Row-Level Security) by default. For public uploads, we need to either:
- Disable RLS (easiest for testing)
- Create policies that allow authenticated users (more secure)
- Ensure bucket is public (still need RLS disabled or policies)
