# Complete Implementation Guide - Member Task Upload & Reporting

## Summary

Members can now click on tasks to open a detail view where they can:
- 📄 **Upload documents/files/images**
- 📝 **Report issues to group leaders**
- 📊 **Track submission status**
- ⏰ **View deadline and urgency indicators**

## What Was Built

### New Functionality
1. **Task Detail Dialog** - Shows when member clicks on task
2. **File Upload** - Upload any file type to Supabase storage
3. **Report System** - Report issues with description
4. **Submission Tracking** - See if document was submitted

### Code Files

#### NEW: `tasknity/lib/screens/task_detail_dialog.dart`
Complete 240+ line file with TaskDetailDialog widget
- File picker integration
- Storage upload logic
- Report submission logic
- Submission status checking

#### MODIFIED: `tasknity/lib/screens/group_dashboard.dart`
- Added import for task_detail_dialog
- Added `_showTaskDetail()` method
- Updated task card `onTap` to call new method

#### MODIFIED: `tasknity/pubspec.yaml`
- Added `file_picker: ^8.0.0` dependency

### Database Setup Required

#### New Tables

**1. task_submissions** (stores file uploads)
```sql
CREATE TABLE task_submissions (
  id UUID PRIMARY KEY,
  task_id UUID,          -- which task
  user_id UUID,          -- which member
  file_name TEXT,        -- storage path
  file_size BIGINT,      -- bytes
  submitted_at TIMESTAMP -- when uploaded
);
```

**2. task_reports** (stores issue reports)
```sql
CREATE TABLE task_reports (
  id UUID PRIMARY KEY,
  task_id UUID,          -- which task
  reported_by UUID,      -- member id
  reported_to UUID,      -- leader id
  description TEXT,      -- issue details
  status VARCHAR(20),    -- 'open' or 'resolved'
  response TEXT,         -- leader response
  created_at TIMESTAMP
);
```

#### New Storage Bucket
**Name:** `task-submissions`
**Public:** Yes
**Use:** Store uploaded member documents

## Installation Steps

### Step 1: Update Flutter Dependencies
```bash
cd tasknity
flutter pub get
```

### Step 2: Create Database Tables
Go to Supabase SQL Editor and run:
[See QUICK_START_MEMBER_FEATURES.md for complete SQL]

### Step 3: Create Storage Bucket
Go to Supabase Storage, create bucket:
- Name: `task-submissions`
- Public: ✓ checked

### Step 4: Hot Reload Flutter
```bash
# In tasknity folder
flutter run -d web-server
```

### Step 5: Test
1. Login as member
2. Click on task
3. Test upload and report

## How It Works

### User Flow: Upload Document

```
Member Clicks Task
    ↓
TaskDetailDialog Opens
    ├─ Shows task title, description
    ├─ Shows due date & days left
    ├─ Shows submission status
    └─ Shows buttons: [Upload] [Report]
    ↓
Member Clicks "Upload Document"
    ↓
File Picker Dialog Opens
    ↓
Member Selects File
    ↓
File Uploads to Supabase Storage
    ├─ Path: task-submissions/{taskId}_{timestamp}_{filename}
    └─ Recorded in task_submissions table
    ↓
Task Updated
    ├─ document_submitted = true
    ├─ progress = 100%
    └─ Urgency indicator clears
    ↓
Success Message Shown
    ↓
Dialog Closes & Task List Refreshes
```

### User Flow: Report Issue

```
Member Clicks "Report Issue"
    ↓
Report Dialog Opens
    └─ Text field for description
    ↓
Member Types Report
    ↓
Member Clicks "Submit Report"
    ↓
Report Saved to Database
    ├─ task_id
    ├─ reported_by = member ID
    ├─ reported_to = leader ID
    └─ description = user text
    ↓
Success Message Shown
    ↓
Report available in task_reports table for leader
```

## File Locations

```
Project Root/
├── tasknity/                              # Flutter app
│   ├── lib/
│   │   ├── main.dart
│   │   └── screens/
│   │       ├── group_dashboard.dart       # ← MODIFIED
│   │       ├── task_detail_dialog.dart    # ← NEW
│   │       ├── login_screen.dart
│   │       ├── signup_screen.dart
│   │       └── verify_email_screen.dart
│   └── pubspec.yaml                       # ← MODIFIED
│
├── QUICK_START_MEMBER_FEATURES.md         # Quick setup guide
├── MEMBER_FEATURES_SETUP.md               # Detailed setup guide
├── IMPLEMENTATION_SUMMARY.md              # Technical summary
├── CODE_CHANGES_DETAIL.md                 # Code explanation
└── This file (COMPLETE_GUIDE.md)
```

## Key Code Snippets

### Opening Task Detail
```dart
void _showTaskDetail(Map<String, dynamic> task) {
  showDialog(
    context: context,
    builder: (context) => TaskDetailDialog(
      task: task,
      onUploadSuccess: () {
        Navigator.pop(context);
        _fetchTasks();
      },
      groupLeaderId: groupMembers.firstWhere(
        (m) => m['group_role'] == 'leader',
      )['user_id'],
    ),
  );
}
```

### File Upload
```dart
void _uploadDocument() async {
  // Pick file
  final result = await FilePicker.platform.pickFiles();
  
  // Upload to storage
  await supabase.storage.from('task-submissions').upload(
    'task_${taskId}_${timestamp}_${fileName}',
    file,
  );
  
  // Record in database
  await supabase.from('task_submissions').upsert({
    'task_id': task['id'],
    'user_id': currentUser.id,
    'file_name': fileName,
    'submitted_at': DateTime.now(),
  });
  
  // Update task
  await supabase.from('tasks').update({
    'document_submitted': true,
    'progress': 100,
  }).eq('id', task['id']);
}
```

### Report Issue
```dart
void _showReportDialog() {
  showDialog(
    context: context,
    builder: (ctx) => AlertDialog(
      title: Text('Report Issue'),
      content: TextField(
        controller: reportController,
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx), child: Text('Cancel')),
        ElevatedButton(
          onPressed: () async {
            await supabase.from('task_reports').insert({
              'task_id': task['id'],
              'reported_by': currentUser.id,
              'reported_to': groupLeaderId,
              'description': reportController.text,
              'status': 'open',
            });
          },
          child: Text('Submit'),
        ),
      ],
    ),
  );
}
```

## Database Queries

### Find submissions for a task
```sql
SELECT * FROM task_submissions WHERE task_id = '...'
```

### Find reports for a leader
```sql
SELECT * FROM task_reports WHERE reported_to = '...'
```

### Find submissions by member
```sql
SELECT * FROM task_submissions WHERE user_id = '...'
```

### Mark report as resolved
```sql
UPDATE task_reports 
SET status = 'resolved', response = '...' 
WHERE id = '...'
```

## Testing Scenarios

### Scenario 1: Normal Upload
1. Leader creates task with 7-day deadline
2. Member views task (shows normal, not urgent)
3. Member uploads document
4. Document appears in storage and database
5. Task shows "Document Submitted"
6. Task no longer shows as urgent

### Scenario 2: Urgent Upload
1. Task deadline is tomorrow
2. Member opens task (shows red/urgent)
3. Member uploads document
4. After upload, red styling disappears
5. Submission status shows file

### Scenario 3: Report Issue
1. Member encounters problem with task
2. Member clicks "Report Issue"
3. Types "Cannot understand instructions"
4. Report appears in task_reports table
5. reported_to = group leader ID
6. status = 'open'

### Scenario 4: Multiple Members
1. Two members in same group
2. Each has different tasks
3. Each uploads document independently
4. Each report is separate record
5. Leader sees all reports

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| "file_picker not found" | Dependency not installed | Run `flutter pub get` |
| Upload fails silently | Storage bucket doesn't exist | Create public bucket named `task-submissions` |
| Dialog doesn't open | _showTaskDetail not called | Check task card onTap is implemented |
| Submission status blank | Table doesn't exist | Run SQL to create task_submissions |
| Report not saving | RLS blocking write | Run `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` |
| File not in storage | Wrong bucket name | Verify bucket is `task-submissions` |

## Performance

- **Upload Speed**: Depends on file size and internet
- **UI Responsiveness**: isUploading flag shows spinner, non-blocking
- **Database**: Indexed by task_id for fast queries
- **Storage**: Scalable, files organized by task

## Security Notes

🔒 **Current (Development)**
- RLS disabled on tables (easier testing)
- Storage bucket is public
- Uses authenticated user ID from Supabase

🔐 **Production Recommendations**
- Enable RLS with proper policies
- Restrict storage bucket access to owner
- Add file size limits
- Add file type restrictions
- Add virus scanning
- Add submission verification

## Next Features to Add

1. **Leader Response System**
   - View reports in dashboard
   - Add response messages
   - Mark as resolved

2. **Download Submissions**
   - Leaders download uploaded files
   - Batch download all submissions

3. **Notifications**
   - Notify leader when document submitted
   - Notify member when report responded

4. **Versioning**
   - Allow multiple uploads
   - Keep upload history
   - See previous submissions

5. **Analytics**
   - Track submission rates
   - Identify delayed submissions
   - Generate completion reports

## Support Files

📄 **QUICK_START_MEMBER_FEATURES.md** - 5-minute setup guide
📄 **MEMBER_FEATURES_SETUP.md** - Detailed setup with troubleshooting
📄 **IMPLEMENTATION_SUMMARY.md** - Technical overview
📄 **CODE_CHANGES_DETAIL.md** - Code explanation
📄 **DATABASE_SETUP_MEMBER_FEATURES.md** - Database schema
📄 **This file** - Complete guide

## Completion Checklist

- [ ] Run `flutter pub get` in tasknity folder
- [ ] Create task_submissions table in Supabase
- [ ] Create task_reports table in Supabase
- [ ] Create task-submissions storage bucket
- [ ] Hot reload Flutter app
- [ ] Login as member
- [ ] Click on task
- [ ] Test upload functionality
- [ ] Verify file in storage
- [ ] Check task_submissions table
- [ ] Test report functionality
- [ ] Verify task_reports table
- [ ] Test urgency clearing after upload

## Files Summary

| File | Status | Purpose |
|------|--------|---------|
| task_detail_dialog.dart | ✅ NEW | Task detail & upload interface |
| group_dashboard.dart | ✅ UPDATED | Added task detail handler |
| pubspec.yaml | ✅ UPDATED | Added file_picker dependency |
| task_submissions | 📋 SQL | Store file submissions |
| task_reports | 📋 SQL | Store issue reports |
| task-submissions | 📋 STORAGE | Store uploaded files |

---

**Status:** ✅ Implementation Complete - Ready for Database Setup
**Next Step:** Run SQL commands from QUICK_START_MEMBER_FEATURES.md
