# Member Features - Visual Summary

## 🎯 What Members Can Do Now

```
┌─────────────────────────────────────────────────────┐
│  MEMBER DASHBOARD - View as: Member                 │
├─────────────────────────────────────────────────────┤
│                                                       │
│  My Tasks                                            │
│  ┌──────────────────────────────────────────────┐   │
│  │ mines                                        │   │
│  │ Status: pending                              │   │
│  │ Due: 2026-01-16 (0 days left) ⚠️ URGENT      │ ← CLICK
│  │                                      [→]     │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
└─────────────────────────────────────────────────────┘
         ↓ Click on task
         ↓
    Task Detail Opens
         ↓
┌──────────────────────────────────────────┐
│ Task Detail                              │
├──────────────────────────────────────────┤
│ mines                                    │
│ Description: Work on project X           │
│                                          │
│ ┌─ Status Card ──────────────────────┐  │
│ │ Status: PENDING                    │  │
│ │ Due: 2026-01-16                    │  │
│ │ ⏰ 0 days remaining (URGENT!)       │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌─ Submission Status ────────────────┐  │
│ │ ⏳ No Document Submitted            │  │
│ └────────────────────────────────────┘  │
│                                          │
│ [📤 Upload Document]  [📋 Report Issue]  │
│                                          │
│                                  [Close]  │
└──────────────────────────────────────────┘
```

## 📤 Upload Flow

```
Member Clicks "Upload Document"
    ↓
┌─────────────────────────┐
│ File Picker Dialog      │
│ (Platform native)       │
│                         │
│ Select file...          │
│ [Pick File]             │
└─────────────────────────┘
    ↓
Member Selects: "project_report.pdf"
    ↓
┌─────────────────────────┐
│ Uploading...      ⟳     │
│ [████████░░░░] 70%      │
└─────────────────────────┘
    ↓
Upload to Supabase Storage ✓
Record in Database ✓
Update Task Status ✓
    ↓
┌──────────────────────────┐
│ ✓ Document uploaded      │
│   successfully!          │
└──────────────────────────┘
    ↓
Dialog Closes & Task Refreshes
    ↓
Task Card Now Shows:
  Document Submitted ✓
  No Urgency (green)
```

## 📝 Report Flow

```
Member Clicks "Report Issue"
    ↓
┌────────────────────────────────────┐
│ Report Issue                       │
├────────────────────────────────────┤
│                                    │
│ Describe the issue:                │
│ ┌──────────────────────────────┐  │
│ │ I don't understand the      │  │
│ │ requirements for this task. │  │
│ │ The description is unclear. │  │
│ │                              │  │
│ │                              │  │
│ └──────────────────────────────┘  │
│                                    │
│        [Cancel] [Submit Report]    │
└────────────────────────────────────┘
    ↓
Report Sent to Database ✓
    ├─ task_id
    ├─ reported_by: member
    ├─ reported_to: leader
    └─ description: user text
    ↓
┌────────────────────────────────────┐
│ ✓ Report submitted to              │
│   group leader                     │
└────────────────────────────────────┘
```

## 🗄️ Database Structure

```
┌─────────────────────────────────┐
│         SUPABASE                │
├─────────────────────────────────┤
│                                 │
│ TABLES:                         │
│ ├─ profiles                     │
│ ├─ groups                       │
│ ├─ group_members                │
│ ├─ tasks                        │
│ ├─ task_submissions  ← NEW      │
│ └─ task_reports      ← NEW      │
│                                 │
│ STORAGE:                        │
│ └─ task-submissions/  ← NEW     │
│    ├─ task_abc123_xxx.pdf       │
│    └─ task_def456_yyy.png       │
│                                 │
└─────────────────────────────────┘
```

### task_submissions Table
```
┌─────────────┬───────────┬──────────┬─────────────────────┐
│ id (UUID)   │ task_id   │ user_id  │ file_name           │
├─────────────┼───────────┼──────────┼─────────────────────┤
│ abc-123     │ task-1    │ user-5   │ task_1_163829_rep... │
│ def-456     │ task-2    │ user-6   │ task_2_163850_img... │
│ ghi-789     │ task-1    │ user-7   │ task_1_163901_doc... │
└─────────────┴───────────┴──────────┴─────────────────────┘
```

### task_reports Table
```
┌─────────┬─────────┬──────────┬──────────┬──────────────────┐
│ id      │ task_id │ rep_by   │ rep_to   │ description      │
├─────────┼─────────┼──────────┼──────────┼──────────────────┤
│ rep-1   │ task-3  │ user-8   │ user-2   │ Unclear instruc... │
│ rep-2   │ task-4  │ user-9   │ user-3   │ Missing files...  │
└─────────┴─────────┴──────────┴──────────┴──────────────────┘
```

## 📊 Task Card States

### Before Upload - URGENT ⚠️
```
┌──────────────────────────────┐
│ mines                        │  ← RED TEXT (urgent)
│ Status: pending              │
│ Due: 2026-01-16 (0 days)     │  ← RED TEXT
│                              │
│     Card Background: RED     │  ← LIGHT RED TINT
│                          [→]  │
└──────────────────────────────┘
```

### After Upload - NORMAL ✓
```
┌──────────────────────────────┐
│ mines                        │  ← BLACK TEXT
│ Status: pending              │
│ Due: 2026-01-16 (0 days)     │  ← GREY TEXT
│                              │
│     Card Background: WHITE   │  ← NO RED
│                          [→]  │
└──────────────────────────────┘
```

## 🔄 Complete User Journey

```
┌──────────┐
│ 1. Login │
│ Member   │
└────┬─────┘
     │
     ↓
┌─────────────────────┐
│ 2. View Dashboard   │
│ See task "mines"    │
│ Shows urgent (red)  │
└────┬────────────────┘
     │
     ↓
┌──────────────────────┐
│ 3. Click Task        │
│ Opens detail dialog  │
└────┬─────────────────┘
     │
     ├─── Option A: Upload ───────┐
     │                            ↓
     │               ┌────────────────────────┐
     │               │ 4A. Select File        │
     │               │ 5A. Upload to Storage  │
     │               │ 6A. Record Submission  │
     │               │ 7A. Update Task Status │
     │               │ 8A. Refresh List       │
     │               └────────┬───────────────┘
     │                        ↓
     │            ✓ Document Now Submitted
     │            ✓ Urgency Cleared
     │                        │
     └─── Option B: Report ───┤
                              ↓
     ┌──────────────────────────────┐
     │ 4B. Open Report Dialog        │
     │ 5B. Type Description          │
     │ 6B. Submit to Leader          │
     │ 7B. Record in task_reports    │
     └──────────────┬───────────────┘
                    ↓
           ✓ Report Submitted
           ✓ Leader Notified
```

## 📱 UI Components

### Task Detail Dialog Layout
```
┌─────────────────────────────────┐
│      Task Title (Header)        │  ← AlertDialog.title
├─────────────────────────────────┤
│  SingleChildScrollView:         │  ← DialogContent
│  ┌────────────────────────────┐ │
│  │ Full Description Text      │ │
│  └────────────────────────────┘ │
│                                 │
│  ┌──── Status Card ───────────┐ │
│  │ Status: [PENDING/DONE]     │ │
│  │ Due: 2026-01-16            │ │
│  │ Days: 0 remaining (URGENT) │ │
│  └────────────────────────────┘ │
│                                 │
│  ┌─ Submission Status ────────┐ │
│  │ ✓ Submitted / ⏳ Not Yet   │ │
│  │ File: filename.pdf         │ │
│  └────────────────────────────┘ │
│                                 │
│  [Upload] [Report] or [Loading]│ │
└─────────────────────────────────┘
│         [Close]                 │
└─────────────────────────────────┘
```

## 🛠️ Technology Stack

```
┌──────────────────────────────────┐
│  Flutter App (Dart)              │
│  ├─ task_detail_dialog.dart      │ ← UI Widget
│  ├─ group_dashboard.dart         │ ← Task List
│  └─ file_picker: ^8.0.0          │ ← File Selection
└────────┬─────────────────────────┘
         │
         ↓ API Calls
         │
┌────────────────────────────────────┐
│  Supabase                          │
│  ├─ Auth (User ID)                 │
│  ├─ Database                       │
│  │  ├─ task_submissions            │
│  │  └─ task_reports                │
│  └─ Storage (Files)                │
│     └─ task-submissions/           │
└────────────────────────────────────┘
```

## ✅ Implementation Checklist

```
Code Implementation:
  ✅ Created task_detail_dialog.dart
  ✅ Updated group_dashboard.dart
  ✅ Updated pubspec.yaml
  ✅ Added file_picker dependency
  ✅ No compilation errors

Database Setup Required:
  ⬜ Create task_submissions table
  ⬜ Create task_reports table
  ⬜ Create task-submissions storage bucket
  ⬜ Disable RLS on tables

Testing:
  ⬜ Run: flutter pub get
  ⬜ Click task → opens dialog
  ⬜ Upload file → success
  ⬜ Report issue → success
  ⬜ Verify database records
```

## 🎓 Learn More

📖 Documentation Files:
- `QUICK_START_MEMBER_FEATURES.md` - 5-min setup
- `MEMBER_FEATURES_SETUP.md` - Full setup guide
- `CODE_CHANGES_DETAIL.md` - Code explanation
- `COMPLETE_GUIDE_MEMBER_FEATURES.md` - Everything

## 🚀 Status

```
┌─────────────────────────────────┐
│ IMPLEMENTATION: ✅ COMPLETE     │
│ CODE: ✅ READY TO USE           │
│ DATABASE: ⏳ AWAITING SETUP     │
│ TESTING: ⏳ READY WHEN SET UP   │
└─────────────────────────────────┘

Next Step: Run SQL commands to create tables
Time Estimate: 5 minutes setup + testing
```
