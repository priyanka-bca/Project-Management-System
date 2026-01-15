# Code Changes Detail

## File 1: New File - task_detail_dialog.dart

**Location:** `tasknity/lib/screens/task_detail_dialog.dart`

This is a complete new file containing the TaskDetailDialog widget that members interact with when they click on a task.

### Key Components:

1. **TaskDetailDialog Widget** (StatefulWidget)
   - Input parameters:
     - `task` - Map with task data
     - `onUploadSuccess` - Callback when upload succeeds
     - `groupLeaderId` - ID of group leader for reports

2. **_showTaskDetail() Method in GroupDashboard**
   - Called when member clicks a task
   - Opens the dialog with task data
   - Passes group leader ID from group members list
   - Refreshes tasks on success

3. **_uploadDocument() Method**
   ```dart
   - Uses FilePicker.platform.pickFiles() to select file
   - Uploads to: supabase.storage.from('task-submissions').upload()
   - Creates filename: 'task_{taskId}_{timestamp}_{originalName}'
   - Records in database: supabase.from('task_submissions').upsert()
   - Updates task: document_submitted = true, progress = 100
   - Shows success message
   ```

4. **_showReportDialog() Method**
   ```dart
   - Creates AlertDialog with TextField
   - Gets report description from user
   - Inserts into task_reports table:
     - task_id, reported_by (current user), reported_to (leader)
     - description, status='open'
     - created_at timestamp
   - Shows success/error messages
   ```

5. **_checkForUploadedDocument() Method**
   - Runs on dialog open
   - Queries task_submissions table for this task
   - Updates UI to show submission status
   - Displays uploaded filename if found

### UI Layout:
```
AlertDialog
├── Title (Task name)
├── Content (Scrollable)
│   ├── Description
│   ├── Status Card (Status, Due Date, Days Left)
│   ├── Submission Card (Submitted/Not Submitted)
│   └── Action Buttons
│       ├── Upload Document (Blue)
│       └── Report Issue (Orange)
└── Actions (Close button)
```

## File 2: Modified File - group_dashboard.dart

**Location:** `tasknity/lib/screens/group_dashboard.dart`

### Changes Made:

1. **Import Added (Line 3)**
   ```dart
   import 'task_detail_dialog.dart';
   ```

2. **New Method Added (After _showAddTaskDialog)**
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
           orElse: () => {},
         )['user_id'],
       ),
     );
   }
   ```

3. **Task Card onTap Updated (Line ~836)**
   ```dart
   // BEFORE:
   onTap: () {
     // Navigate to task detail
   },
   
   // AFTER:
   onTap: () {
     _showTaskDetail(task);
   },
   ```

## File 3: Modified File - pubspec.yaml

**Location:** `tasknity/pubspec.yaml`

### Dependency Added:
```yaml
dependencies:
  fl_chart: ^0.68.0 
  supabase_flutter: ^2.5.0
  flutter_dotenv: ^5.0.2
  file_picker: ^8.0.0  # <-- NEW LINE
  flutter:
    sdk: flutter

  http: ^1.1.0
  provider: ^6.1.2
  intl: ^0.19.0
  shared_preferences: ^2.1.0
  cupertino_icons: ^1.0.8
```

`file_picker: ^8.0.0` enables native file selection on all platforms.

## Method Details

### _uploadDocument() Flow
```
1. User clicks "Upload Document"
2. FilePicker.platform.pickFiles() opens file browser
3. User selects file
4. Check file path exists
5. Create timestamp-based filename
6. Upload to Supabase storage
7. Create task_submissions record
8. Update tasks table (document_submitted, progress)
9. Close dialog
10. Refresh task list
11. Show success message
```

### _showReportDialog() Flow
```
1. User clicks "Report Issue"
2. AlertDialog opens with TextField
3. User types report description
4. User clicks "Submit Report"
5. Validate description not empty
6. Insert into task_reports table:
   - task_id (current task)
   - reported_by (current user)
   - reported_to (group leader)
   - description (user entered text)
   - status = 'open'
   - created_at = now()
7. Close report dialog
8. Show success message
```

### _checkForUploadedDocument() Flow
```
1. Dialog opens (initState)
2. Query task_submissions table
3. Filter by task_id = current task
4. If found:
   - setState to update uploadedFileName
   - UI shows submitted status with filename
5. If not found:
   - UI shows "No Document Submitted"
```

## Error Handling

All operations wrapped in try-catch:

```dart
try {
  // Operation (upload, report, query)
} catch (e) {
  if (mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Error: $e')),
    );
  }
}
```

Checks `if (mounted)` before setState to prevent errors.

## State Management

Uses basic StatefulWidget with setState:
- `isUploading` - Shows loading spinner during upload
- `uploadedFileName` - Stores current submission filename
- Dialog rebuilds when state changes

## Supabase Integration

Uses Supabase client for:
1. **Storage Upload**
   ```dart
   supabase.storage
     .from('task-submissions')
     .upload(fileName, file)
   ```

2. **Database Insert/Upsert**
   ```dart
   supabase.from('task_submissions').upsert({...})
   supabase.from('task_reports').insert({...})
   supabase.from('tasks').update({...})
   ```

3. **Database Query**
   ```dart
   supabase.from('task_submissions').select().eq('task_id', ...)
   ```

## Security Considerations

- ✅ Uses authenticated user ID from supabase.auth.currentUser
- ✅ Task ID from task data (passed from list)
- ✅ Leader ID from group members (verified in group)
- ✅ Storage bucket is public but files are namespaced by task
- ⚠️ RLS disabled for testing - should be enabled in production with policies

## Performance Notes

- Single file pick at a time
- File size not restricted (add validation if needed)
- Storage upload happens in background (isUploading flag)
- Database queries are indexed:
  - task_submissions: idx_task_submissions_task_id
  - task_reports: idx_task_reports_task_id
- Lazy loading of submission status (checked only when dialog opens)

## Testing Points

| Feature | Test Action | Expected Result |
|---------|------------|-----------------|
| View Task | Click task card | Dialog opens with task details |
| Upload | Click Upload, select file | File stored, submission recorded |
| Submission Status | Check after upload | Shows "Submitted" with filename |
| Report | Click Report, enter text | Report stored in database |
| Urgency Clear | Upload before deadline | Red card becomes normal |
| Multiple Tasks | Upload one, click other | Each shows own submission status |
