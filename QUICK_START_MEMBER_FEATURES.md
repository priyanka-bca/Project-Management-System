# Quick Start: Member Task Features

## TL;DR - What to Do Now

### 1. Update Flutter App
```bash
cd tasknity
flutter pub get
```

### 2. Create Database Tables (Supabase SQL Editor)
Copy and run this SQL:
```sql
CREATE TABLE IF NOT EXISTS task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id ON task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_user_id ON task_submissions(user_id);

CREATE TABLE IF NOT EXISTS task_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL,
  reported_to UUID NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open',
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_reports_task_id ON task_reports(task_id);
CREATE INDEX IF NOT EXISTS idx_task_reports_reported_to ON task_reports(reported_to);
CREATE INDEX IF NOT EXISTS idx_task_reports_status ON task_reports(status);

ALTER TABLE task_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_reports DISABLE ROW LEVEL SECURITY;
```

### 3. Create Storage Bucket (Supabase Storage)
1. Click "New Bucket"
2. Name: `task-submissions`
3. Set to **Public**
4. Create

Or in SQL Editor:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-submissions', 'task-submissions', true)
ON CONFLICT DO NOTHING;
```

### 4. Test
1. Hot reload Flutter app
2. Login as member
3. View as: Member
4. Click on a task
5. Click "Upload Document" and test
6. Click "Report Issue" and test

## What Members Can Now Do

✅ **Click on tasks** to view full details  
✅ **Upload documents** - any file type  
✅ **See submission status** - if they uploaded  
✅ **Report issues** - with description to leader  
✅ **Track deadlines** - days remaining and urgency  

## Files Changed

- ✅ `tasknity/lib/screens/task_detail_dialog.dart` - NEW
- ✅ `tasknity/lib/screens/group_dashboard.dart` - UPDATED
- ✅ `tasknity/pubspec.yaml` - UPDATED (added file_picker)

## Code Location Reference

**Task Detail Dialog:**
- File: `tasknity/lib/screens/task_detail_dialog.dart`
- Widget: `TaskDetailDialog` (StatefulWidget)
- Key Methods:
  - `_checkForUploadedDocument()` - Check if submitted
  - `_uploadDocument()` - Handle file upload
  - `_showReportDialog()` - Show report form

**Group Dashboard Updates:**
- File: `tasknity/lib/screens/group_dashboard.dart`
- New Method: `_showTaskDetail()` - Open task dialog
- Updated: Task card `onTap` callback
- Import: Added task_detail_dialog

## Database Schema at a Glance

### task_submissions
Stores document uploads
```
task_id → which task
user_id → which member
file_name → path in storage
submitted_at → when uploaded
```

### task_reports
Stores issue reports
```
task_id → which task
reported_by → member user_id
reported_to → leader user_id
description → what the issue is
status → 'open' or 'resolved'
```

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| file_picker not found | Run `flutter pub get` |
| Storage bucket error | Create bucket (must be PUBLIC) |
| Upload fails | Check internet connection, valid task_id |
| Tables don't exist | Run SQL commands in Supabase Editor |
| RLS blocking queries | Ensure DISABLE ROW LEVEL SECURITY ran |

## Next Steps

1. Run SQL to create tables
2. Create storage bucket
3. `flutter pub get`
4. Hot reload
5. Test member upload flow
6. Test report flow

All code is ready - just need database setup!
