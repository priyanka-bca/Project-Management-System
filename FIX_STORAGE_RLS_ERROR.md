# Fix Storage RLS Issue

The error "new row violates row-level security policy" means the storage bucket needs RLS disabled or policies configured.

## Quick Fix - Disable RLS on Storage

Run this SQL in Supabase SQL Editor:

```sql
-- Disable RLS on storage.objects to allow uploads
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

That's it! Just one line.

## Alternative - If You Want to Keep RLS Enabled

If you prefer to keep RLS for security, create this policy instead:

```sql
-- Allow authenticated users to upload files to task-submissions bucket
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'task-submissions' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own files
CREATE POLICY "Allow users to update own files"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'task-submissions'
  AND auth.role() = 'authenticated'
  AND owner = auth.uid()
);
```

## Steps to Fix

1. Go to Supabase SQL Editor
2. Copy the SQL above (either the quick fix or the policy approach)
3. Run it
4. Go back to Flutter app and try uploading again

## Recommendation

For development/testing: **Use the quick fix (DISABLE RLS)**
- Simpler
- Works immediately
- Good for testing

For production: **Use the policy approach**
- More secure
- Restricts access properly
- Better for live systems
