# Deadline Enforcement Feature Flow Diagrams

## Flow 1: Document Upload Deadline Check

```
┌─────────────────────────────────────────────────┐
│  Member Opens Task in Mobile App                │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  Clicks "Upload Document" Button                │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  _uploadDocument() Method Called                │
└──────────────┬──────────────────────────────────┘
               │
               ▼
        ┌──────────────┐
        │  Check:      │
        │ Current Date │
        │   vs.        │
        │   Due Date   │
        └────┬─────────┘
             │
      ┌──────┴──────────────┐
      │                     │
      ▼ AFTER              ▼ BEFORE/ON
      
   ✗ BLOCKED            ✓ ALLOWED
      │                    │
      ▼                    ▼
   Show Error          Open File
   "Deadline           Picker
    Passed..."         │
      │                ▼
      │           User Selects
      │           File
      │                │
      │                ▼
      │           Upload File
      │                │
      │                ▼
      │           Record in DB:
      │           - task_submissions
      │           - Update tasks
      │           - document_submitted=true
      │                │
      │                ▼
      │           Show Success
      │           Message
      │
      └─────────┬────────┘
                ▼
           Return to Task List
```

---

## Flow 2: Missed Deadline Notification (Mobile)

```
┌─────────────────────────────────────────────────┐
│  Member Opens Task Detail Dialog                │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  initState() Called                             │
│  - _fetchSubmissions()                          │
│  - _checkDeadlineAndNotify() ← NEW              │
└──────────────┬──────────────────────────────────┘
               │
               ▼
        ┌─────────────────────┐
        │  Check Conditions:  │
        │                     │
        │ 1. Due Date Passed? │
        │    DateTime.now()   │
        │    .isAfter(dueDate)│
        │                     │
        │ 2. Not Completed?   │
        │    status ≠         │
        │    "completed"      │
        │                     │
        │ 3. No Document?     │
        │    document_submitted│
        │    ≠ true           │
        └────┬────────────────┘
             │
        ┌────┴─────────────────┐
        │                      │
        ALL YES          ANY NO/FALSE
        │                      │
        ▼                      ▼
    ✓ NOTIFY             NO ACTION
    LEADER               │
        │                ▼
        ▼            Task displays
   _notifyLeader...  normally
        │
        ▼
   Query Supabase:
   - Get group name
   - Get leader ID
        │
        ▼
   Insert Notification:
   - type: "task_deadline_missed"
   - user_id: group_leader_id
   - title: "Task Deadline Missed"
   - message: "Member has not..."
   - task_id: task['id']
   - is_read: false
        │
        ▼
   Notification Saved
   to Database ✓
        │
        ▼
   Leader Gets Alert
   (within next hour)
```

---

## Flow 3: Missed Deadline Detection (Admin Dashboard)

```
┌─────────────────────────────────────────────────┐
│  Admin Opens Notifications.jsx                  │
│  useEffect() → checkAndCreateNotifications()    │
│  (Runs every hour)                              │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  Query 1: Get UPCOMING Tasks                    │
│  - status = "pending"                           │
│  - document_submitted = false                   │
│  - due_date ≥ today                             │
│  - due_date ≤ tomorrow (24h)                    │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  Query 2: Get MISSED Deadline Tasks ← NEW       │
│  - status = "pending"                           │
│  - document_submitted = false                   │
│  - due_date < today (PAST)                      │
└──────────────┬──────────────────────────────────┘
               │
               ▼
        ┌──────────────────┐
        │  Prevent Dupes:  │
        │                  │
        │  Check existing  │
        │  notifications   │
        │  with:           │
        │  task_id +       │
        │  user_id +       │
        │  type            │
        └────┬─────────────┘
             │
             ▼
      ┌──────────────────┐
      │  For Each Task:  │
      │                  │
      │  1. Get group    │
      │     leader ID    │
      │  2. Check if     │
      │     notif exists │
      │  3. If not,      │
      │     create new   │
      └────┬─────────────┘
           │
           ▼
    ┌─────────────────┐
    │ UPCOMING TASKS  │
    │ (Amber/Yellow)  │
    │                 │
    │ type:           │
    │ document_overdue│
    │ user_id:        │
    │ assigned_to     │
    │ (member)        │
    └────┬────────────┘
         │
         ▼
    Insert Notification
         │
         ▼
    ┌──────────────────┐
    │  MISSED DEADLINE │
    │  TASKS (Red)     │
    │                  │
    │  type:           │
    │  task_deadline...│
    │  user_id:        │
    │  created_by      │
    │  (leader)        │
    └────┬─────────────┘
         │
         ▼
    Insert Notification
         │
         ▼
    Load & Display
    Notifications
         │
         ▼
    Admin Dashboard
    Shows Alerts
```

---

## Flow 4: Notification Display & Actions

```
┌─────────────────────────────────────────────────┐
│  Admin Dashboard Notifications Section          │
└──────────────┬──────────────────────────────────┘
               │
               ▼
    ┌─────────────────────────┐
    │  Filter Notifications   │
    │  type IN                │
    │  [document_overdue,     │
    │   task_deadline_missed] │
    │                         │
    │  Order by created_at    │
    │  Limit: 20              │
    └──────────┬──────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │  Display Notification Card   │
    └──────────┬───────────────────┘
               │
         ┌─────┴─────────┐
         │               │
    UPCOMING        MISSED DEADLINE
    (type A)        (type B)
         │               │
    Amber BG         Red BG
    📋 Doc Due    ⚠️ Missed
         │               │
         └─────┬─────────┘
               │
               ▼
        ┌─────────────────┐
        │  Action Buttons │
        └────┬────────────┘
             │
        ┌────┴────────────┐
        │                 │
      [Mark Read]    [Dismiss]
        │                 │
        ▼                 ▼
    Update:           Delete:
    is_read=true      notification
        │              record
        │                │
        └────┬───────────┘
             │
             ▼
        Refresh List
        Re-render UI
```

---

## Flow 5: Complete Task Lifecycle (Timeline)

```
Timeline: Task Created to Deadline Missed
═══════════════════════════════════════════════════

Day 1: Task Created
┌──────────────────────────────────┐
│ Leader creates task              │
│ Title: "Submit Report"           │
│ Due Date: January 20, 2026       │
│ Status: pending                  │
│ document_submitted: false        │
└──────────────────────────────────┘

Day 5: Member Working (5 days left)
┌──────────────────────────────────┐
│ Member opens task               │
│ - Sees "5 days remaining"        │
│ - No deadline passed check yet  │
│ - Can upload documents ✓        │
│ - No notification needed        │
└──────────────────────────────────┘

Day 19: Before Deadline (1 day left)
┌──────────────────────────────────┐
│ Member opens task               │
│ - Sees "1 day remaining" (RED)   │
│ - Urgent indicator appears      │
│ - Can still upload ✓            │
│ - No notification yet           │
└──────────────────────────────────┘

Day 20: DEADLINE
┌──────────────────────────────────┐
│ Deadline Date (Jan 20)           │
│ Member tries to upload:          │
│ - Check: Now > deadline? YES     │
│ - Block upload ✗                │
│ - Show error message            │
│ - No file uploaded              │
└──────────────────────────────────┘

Day 20: After Deadline
┌──────────────────────────────────┐
│ Member opens task:              │
│ - Check: deadline passed? YES ✓ │
│ - Check: not completed? YES ✓   │
│ - Check: no document? YES ✓     │
│ - ALL CHECKS PASS →             │
│ - Send notification to leader   │
│ - Notification saved in DB      │
└──────────────────────────────────┘

Day 21: Leader Sees Alert
┌──────────────────────────────────┐
│ Admin Dashboard Notifications:  │
│                                  │
│ RED CARD:                        │
│ ⚠️ Task Deadline Missed          │
│ "Submit Report"                  │
│                                  │
│ Member: failed to submit by      │
│ Jan 20, 2026                     │
│                                  │
│ Actions:                         │
│ [Mark Read] [Dismiss]            │
└──────────────────────────────────┘

Possible Outcomes:
├─ Member uploaded before Day 20
│  └─ NO notification sent ✓
│
├─ Member marked task completed
│  └─ NO notification sent ✓
│
├─ Member missed deadline, no upload
│  └─ NOTIFICATION sent ⚠️
│     └─ Leader sees RED alert
│        └─ Can acknowledge or extend
│
└─ Never opened task after deadline
   └─ Notification sent when they open ⚠️
      └─ Eventually sees alert
```

---

## Flow 6: Notification Deduplication Logic

```
┌─────────────────────────────────────────────────┐
│  Check Existing Notifications                   │
│  SELECT task_id, user_id, type                  │
│  FROM notifications                            │
└──────────────┬──────────────────────────────────┘
               │
               ▼
        Create Set of Keys:
        "{task_id}-{user_id}-{type}"
        
        Examples:
        "task-123-user-456-document_overdue"
        "task-123-user-456-task_deadline_missed"
        "task-789-user-456-document_overdue"
               │
               ▼
    For Each New Notification:
    Generate Key with same format
               │
               ▼
        ┌──────────────────┐
        │  Check if Key    │
        │  exists in Set   │
        └────┬──────┬──────┘
             │      │
        EXISTS   NOT EXISTS
             │      │
             ▼      ▼
        SKIP     CREATE
        (Dupe)   (New)
             │      │
             └──┬───┘
                ▼
            Insert into
            notifications
            table
                │
                ▼
            Notification
            Saved ✓
```

---

## State Diagram: Task & Notification States

```
TASK STATES:
═════════════════════════════════════════════════

                 ┌────────────┐
                 │  PENDING   │
                 └─────┬──────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
    Member     Deadline       Task
    Uploads    Passes      Completed
         │             │             │
         ▼             ▼             ▼
    ┌─────────┐  ┌─────────┐  ┌──────────┐
    │ PENDING │  │ PENDING │  │COMPLETED │
    │+DOC     │  │+NO DOC  │  │          │
    └─────────┘  └────┬────┘  └──────────┘
                      │
                      │ Notification sent when
                      │ member opens task:
                      │ - status=pending ✓
                      │ - document_submitted=false ✓
                      │ - deadline passed ✓
                      │
                      ▼
               ⚠️ NOTIFY LEADER
                      │
                      ▼
               Notification Created

NOTIFICATION STATES:
═════════════════════════════════════════════════

Created (is_read=false)
    │
    ├─→ [Mark Read] → is_read=true (Acknowledged)
    │
    └─→ [Dismiss] → Deleted from list
```

---

## Implementation Checkpoint Diagram

```
IMPLEMENTATION COMPLETE
═════════════════════════════════════════════════

Feature 1: Deadline Upload Block
┌─────────────────────────────────┐
│ ✅ Code implemented             │
│ ✅ Error handling added         │
│ ✅ User message clear           │
│ ✅ File picker blocked          │
│ ✅ Database unaffected          │
│ ✅ Tested on device             │
└─────────────────────────────────┘
         │
         ▼
Feature 2: Missed Deadline Notification
┌─────────────────────────────────┐
│ ✅ Code implemented             │
│ ✅ Notification creation logic  │
│ ✅ Group name fetched           │
│ ✅ Leader ID included           │
│ ✅ DB record created            │
│ ✅ Error handling in place      │
└─────────────────────────────────┘
         │
         ▼
Feature 3: Admin Dashboard Updates
┌─────────────────────────────────┐
│ ✅ Hourly check added           │
│ ✅ Missed deadline detection    │
│ ✅ Leader notification created  │
│ ✅ Duplicate prevention         │
│ ✅ Color coding implemented     │
│ ✅ UI updated with labels       │
└─────────────────────────────────┘
         │
         ▼
Feature 4: Documentation
┌─────────────────────────────────┐
│ ✅ Implementation guide         │
│ ✅ Quick reference created      │
│ ✅ Code comments added          │
│ ✅ Testing guide provided       │
│ ✅ Troubleshooting docs         │
│ ✅ Flow diagrams included       │
└─────────────────────────────────┘
         │
         ▼
    🎉 READY FOR TESTING
```

---

**Status**: ✅ COMPLETE - All flows implemented and documented
**Last Updated**: January 16, 2026
