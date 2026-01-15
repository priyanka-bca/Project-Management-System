# Member Task Features Setup Guide

This document explains how to set up the new member task features including document uploads and reporting.

## What's New

Members can now:
1. **View Task Details** - Click on any assigned task to see full details
2. **Upload Documents** - Submit files, images, or documents for tasks
3. **Report Issues** - Report task-related issues to their group leader
4. **Track Submission Status** - See if they've submitted a document and when

Leaders can:
1. View which members submitted documents
2. Track document submission status
3. Respond to member reports

## Setup Steps

### Step 1: Create Database Tables

Run the following SQL commands in your Supabase SQL Editor (https://app.supabase.com):

```sql
-- Create task_submissions table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id ON task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_user_id ON task_submissions(user_id);

-- Create task_reports table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_task_reports_task_id ON task_reports(task_id);
CREATE INDEX IF NOT EXISTS idx_task_reports_reported_to ON task_reports(reported_to);
CREATE INDEX IF NOT EXISTS idx_task_reports_status ON task_reports(status);

-- Disable RLS for testing (enable in production with policies)
ALTER TABLE task_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_reports DISABLE ROW LEVEL SECURITY;
```

### Step 2: Create Storage Bucket

In Supabase Storage (https://app.supabase.com/project/_/storage/buckets):

1. Click "New Bucket"
2. Name: `task-submissions`
3. Set to **Public** (so members can access their files)
4. Click "Create Bucket"

Alternatively, run in SQL Editor:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-submissions', 'task-submissions', true)
ON CONFLICT DO NOTHING;
```

### Step 3: Install Flutter Dependencies

Run in the tasknity folder:
```bash
flutter pub get
```

This will install the `file_picker` package needed for uploads.

### Step 4: Test the Features

1. **Login as a Member**
   - Use a member account in the Flutter app
   - Navigate to Group Dashboard
   - View as: Member

2. **Test Task Viewing**
   - Click on any task in "My Tasks" section
   - Task detail dialog should open showing:
     - Task title and description
     - Status (Pending, In Progress, Completed)
     - Due date and days remaining
     - Document submission status

3. **Test Document Upload**
   - In task detail dialog, click "Upload Document"
   - Select any file (PDF, image, etc.)
   - Wait for upload to complete
   - Submit button text will update and submission status will show

4. **Test Report Issue**
   - Click "Report Issue" button
   - Type a report description
   - Click "Submit Report"
   - Check Supabase task_reports table to verify

## Database Schema

### task_submissions
```
id (UUID) - Primary key
task_id (UUID) - Foreign key to tasks
user_id (UUID) - Member who submitted
file_name (TEXT) - Name of uploaded file in storage
file_size (BIGINT) - Size in bytes
submitted_at (TIMESTAMP) - When document was submitted
created_at (TIMESTAMP) - Record creation time
```

### task_reports
```
id (UUID) - Primary key
task_id (UUID) - Foreign key to tasks
reported_by (UUID) - Member who reported
reported_to (UUID) - Leader receiving report
description (TEXT) - Report details
status (VARCHAR) - 'open' or 'resolved'
response (TEXT) - Leader's response
responded_at (TIMESTAMP) - When leader responded
created_at (TIMESTAMP) - Report creation time
updated_at (TIMESTAMP) - Last update time
```

## Code Files Added/Modified

### New Files:
- `tasknity/lib/screens/task_detail_dialog.dart` - Task detail view with upload and report

### Modified Files:
- `tasknity/lib/screens/group_dashboard.dart`
  - Added import for task_detail_dialog
  - Added `_showTaskDetail()` method
  - Updated task card onTap to open detail dialog
  
- `tasknity/pubspec.yaml`
  - Added `file_picker: ^8.0.0` dependency

## Features Explained

### Task Detail Dialog
When a member clicks on a task, they see:
- Full task information
- Current submission status
- Upload button (disabled after submission)
- Report Issue button

### File Upload
- Uses FilePicker to select any file type
- Uploads to `task-submissions` storage bucket
- Records submission metadata in database
- Marks task as `document_submitted = true`
- Sets progress to 100%

### Report System
- Members can report issues without submitting documents
- Reports stored with timestamp and member info
- Leaders can view reports in admin dashboard
- Status tracking (open/resolved)

## Future Enhancements

1. **Leader Dashboard for Reports**
   - View all submitted reports
   - Filter by status/member
   - Add response messages
   - Mark as resolved

2. **Download Submitted Documents**
   - Leaders can download member submissions
   - View submission history

3. **Notification System**
   - Notify leaders when documents submitted
   - Notify members when reports are responded to

4. **File Type Restrictions**
   - Limit accepted file types (PDF, images, etc.)
   - Validate file size (max upload size)

5. **Progress Tracking**
   - Visual progress indicators for tasks
   - Auto-calculate progress based on submissions

## Troubleshooting

**Error: "file_picker not found"**
- Run `flutter pub get` in tasknity folder
- Restart Flutter dev server

**Upload fails with storage error**
- Verify bucket exists and is public
- Check file permissions in Supabase
- Verify user authentication

**Reports not saving**
- Check task_reports table exists
- Verify RLS is disabled on tables
- Check user_id and task_id are valid UUIDs

**Tasks not showing as urgent**
- Check due_date is set correctly
- Verify database time zone matches
- Check document_submitted flag logic
