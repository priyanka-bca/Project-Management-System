# Fix Storage Upload Error - Complete Solution

Error: "new row violates row-level security policy" when uploading

## Root Causes & Fixes

### 1. Check Bucket Settings (Most Likely Issue)

**In Supabase Dashboard:**
1. Go to **Storage**
2. Click **task-submissions** bucket
3. Click the **three dots** ⋯ menu
4. Click **Edit bucket**
5. **IMPORTANT:** 
   - Public: Should be **checked ✓**
   - Make sure it says "This bucket is public"
6. Click **Save**

### 2. If That Doesn't Work - Try This Code Fix

The issue might be authentication. Update the upload code to be more robust:

Replace the `_uploadDocument()` method with this version that adds better error handling:

```dart
void _uploadDocument() async {
  try {
    final result = await FilePicker.platform.pickFiles(
      allowMultiple: false,
      type: FileType.any,
    );

    if (result != null) {
      setState(() => isUploading = true);

      final fileBytes = result.files.single.bytes;
      if (fileBytes == null) {
        throw Exception('Could not read file');
      }

      final fileName = 'task_${widget.task['id']}_${DateTime.now().millisecondsSinceEpoch}_${result.files.single.name}';
      
      // Verify user is authenticated
      final user = supabase.auth.currentUser;
      if (user == null) {
        throw Exception('User not authenticated');
      }

      // Try uploading with explicit authentication
      await supabase.storage
          .from('task-submissions')
          .uploadBinary(
            fileName,
            fileBytes,
            fileOptions: const FileOptions(
              cacheControl: '3600',
              upsert: true,
            ),
          );

      // Record submission in database
      await supabase.from('task_submissions').upsert({
        'task_id': widget.task['id'],
        'user_id': user.id,
        'file_name': fileName,
        'file_size': fileBytes.length,
        'submitted_at': DateTime.now().toIso8601String(),
      }, onConflict: 'task_id,user_id');

      // Mark task document as submitted
      await supabase.from('tasks').update({
        'document_submitted': true,
        'progress': 100,
      }).eq('id', widget.task['id']);

      if (mounted) {
        setState(() => isUploading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Document uploaded successfully!')),
        );
        widget.onUploadSuccess();
      }
    }
  } catch (e) {
    if (mounted) {
      setState(() => isUploading = false);
      print('Upload error: $e'); // Debug
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Upload failed: $e')),
      );
    }
  }
}
```

### 3. Nuclear Option - Recreate the Bucket

If nothing works, delete and recreate:

**In Supabase Storage:**
1. Click **task-submissions** bucket
2. Click three dots ⋯
3. Click **Delete bucket**
4. Confirm deletion
5. Click **New bucket**
   - Name: `task-submissions`
   - **Public**: ✓ Check this box
   - Click **Create**

### 4. Test Upload Again

After any of these fixes:
1. Go back to Flutter app
2. Click on task
3. Click "Upload Document"
4. Select a small file (like a text file or image)
5. Try uploading

## Verification Steps

Make sure:
- ✓ You're logged in as a member
- ✓ `task-submissions` bucket exists
- ✓ Bucket is set to **Public**
- ✓ You have the latest code (the upload fix above)
- ✓ task_submissions table exists in database
- ✓ Member is assigned to the task

## Still Having Issues?

If it still fails, try this debug version to see exactly what's happening:

In your browser DevTools Console (F12), you should see the detailed error message that will help identify the real issue.

## What We're Trying to Solve

```
Member clicks "Upload Document"
         ↓
FilePicker opens (✓ works)
         ↓
User selects file (✓ works)
         ↓
Code tries to upload to storage
         ↓
ERROR: RLS policy blocking upload ← THIS IS THE ISSUE
         ↓
Fix: Make bucket PUBLIC or adjust code authentication
```

Try the **bucket settings fix first** - that solves 90% of these issues.
