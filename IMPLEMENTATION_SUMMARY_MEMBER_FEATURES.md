# Member Task Features - Implementation Summary

## Overview
Added complete member-side task functionality allowing members to:
1. View detailed task information by clicking on assigned tasks
2. Upload documents/files/images for task completion
3. Report issues to group leaders
4. Track document submission status

## Changes Made

### 1. New File: `tasknity/lib/screens/task_detail_dialog.dart`

A complete StatefulWidget that handles:

**TaskDetailDialog Widget Features:**
- Displays full task details (title, description, status, due date)
- Shows days remaining with urgency indicator (red if < 1 day)
- Document submission status with file information
- File upload button with progress indicator
- Report Issue button

**Upload Functionality:**
- Uses `file_picker` package to select any file type
- Uploads to Supabase storage bucket: `task-submissions`
- Records submission metadata in `task_submissions` database table
- Updates task's `document_submitted` flag to true
- Sets task `progress` to 100%
- Shows success/error messages

**Report Functionality:**
- Opens report dialog with description field
- Records report in `task_reports` table with:
  - Report description
  - Reported member ID and group leader ID
  - Status (open/resolved)
  - Timestamp

### 2. Modified File: `tasknity/lib/screens/group_dashboard.dart`

**Added:**
- Import: `import 'task_detail_dialog.dart';`
- New method: `_showTaskDetail(Map<String, dynamic> task)`
  - Opens TaskDetailDialog when task is clicked
  - Passes task data and group leader ID
  - Refreshes task list on successful upload

**Updated:**
- Task card `onTap` callback (line ~836)
  - Changed from empty `// Navigate to task detail`
  - Now calls `_showTaskDetail(task)`
  - Works for both members and leaders

### 3. Modified File: `tasknity/pubspec.yaml`

**Added Dependency:**
```yaml
file_picker: ^8.0.0
```
- Provides native file selection dialog
- Works on web, Android, iOS, Windows, macOS, Linux

## Database Tables Required

### task_submissions
```sql
CREATE TABLE task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);
```

**Fields:**
- `id` - Unique identifier
- `task_id` - Reference to task
- `user_id` - Member who submitted
- `file_name` - Storage path/filename
- `file_size` - File size in bytes
- `submitted_at` - When member submitted
- `created_at` - Record creation time

### task_reports
```sql
CREATE TABLE task_reports (
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
```

**Fields:**
- `id` - Unique identifier
- `task_id` - Reference to task
- `reported_by` - Member ID
- `reported_to` - Leader ID
- `description` - Report details
- `status` - 'open' or 'resolved'
- `response` - Leader's response message
- `responded_at` - When leader responded
- `created_at/updated_at` - Timestamps

### Storage Bucket
- Name: `task-submissions`
- Public: true
- Stores uploaded files with naming: `task_{taskId}_{timestamp}_{filename}`

## UI Flow

### Member Viewing a Task
1. Member in "Member" view sees "My Tasks" section
2. Tasks show deadline, days remaining, and urgency (red if <1 day)
3. Click task → TaskDetailDialog opens
4. Dialog shows:
   - Title and description
   - Status badge
   - Due date with countdown
   - Submission status (✓ Submitted or ⏳ No Document)
   - Upload Document button
   - Report Issue button

### Document Upload Flow
1. Click "Upload Document"
2. File picker dialog opens
3. Select file → upload starts
4. Progress shown with spinner
5. On success:
   - Dialog closes
   - Task list refreshes
   - Submission status updates to show filename
   - Task no longer shows as urgent (if deadline was close)

### Report Issue Flow
1. Click "Report Issue"
2. Report dialog opens with text field
3. Enter issue description
4. Click "Submit Report"
5. Report saved to database
6. Success message shown
7. Leader notified (if future notifications added)

## Testing Checklist

- [ ] Flutter app compiles without errors
- [ ] `flutter pub get` succeeds with file_picker installed
- [ ] Member can click on task to open detail dialog
- [ ] Task details display correctly (title, description, due date)
- [ ] Submission status shows correctly (submitted or not)
- [ ] Upload Document button opens file picker
- [ ] File upload completes successfully
- [ ] Supabase storage bucket contains uploaded file
- [ ] task_submissions table records the submission
- [ ] tasks table updates document_submitted = true
- [ ] Report Issue button opens report dialog
- [ ] Report submits successfully
- [ ] task_reports table contains the report
- [ ] Dialog closes after successful upload/report
- [ ] Task list refreshes to show updated status

## Integration with Existing Features

**With Task Creation (Leaders):**
- Leaders create tasks with deadline picker
- Members see tasks in "My Tasks"
- Deadline and urgency indicators work as before

**With Task Deadline Urgency:**
- Tasks < 1 day remaining show in red
- After document submitted, urgency clears
- Progress set to 100% on upload

**With Role-Based Access:**
- Only members see "Upload Document" and "Report Issue"
- Leaders see edit/delete menu instead
- Leaders can view task details but not upload documents

## Error Handling

All operations include try-catch with user feedback:
- Upload errors show snackbar message
- Report errors show snackbar message
- Database errors caught and displayed
- Missing files handled gracefully
- Network errors show appropriate messages

## Performance Considerations

- Task_submissions and task_reports indexed by task_id and user_id
- Unique constraint prevents duplicate submissions
- Foreign key cascades delete submissions when task deleted
- File storage uses efficient blob storage
- Lazy loading of submission status (checked on dialog open)

## Future Expansion Points

1. **Add response system for leaders**
   - View reports in admin dashboard
   - Add response messages
   - Change status to resolved

2. **Document versioning**
   - Allow multiple uploads per task
   - Track upload history
   - Download previous submissions

3. **Notifications**
   - Notify leaders when document submitted
   - Notify members when report responded
   - Notify on task deadline approaching

4. **File type validation**
   - Restrict to specific file types
   - Validate file size before upload
   - Virus scan integration

5. **Preview functionality**
   - Preview images before download
   - Preview PDFs in browser
   - Quick view submissions

## Files Summary

| File | Type | Purpose | Status |
|------|------|---------|--------|
| task_detail_dialog.dart | NEW | Member task detail view | ✅ Created |
| group_dashboard.dart | MODIFIED | Added task detail callback | ✅ Updated |
| pubspec.yaml | MODIFIED | Added file_picker dependency | ✅ Updated |
| task_submissions | DB TABLE | Store file submissions | 📋 Manual SQL |
| task_reports | DB TABLE | Store issue reports | 📋 Manual SQL |
| task-submissions | STORAGE | Store uploaded files | 📋 Manual Setup |

**Legend:**
- ✅ Automatically completed
- 📋 Requires manual Supabase SQL/Storage setup
