# React Admin Features Update

## Summary of Changes

Three major features have been added to the React admin application:

---

## 1. ✅ Delete Group Button

**Location**: AdminDashboard.jsx

**Features**:
- Red trash icon (🗑️) on each group card
- Confirmation dialog before deletion
- Cascading delete: removes all group members and tasks when group is deleted
- Automatic refresh of group list after successful deletion
- Error handling with user feedback

**Implementation**:
```jsx
handleDeleteGroup(groupId, groupName)
- Confirms user intention
- Deletes group_members records
- Deletes tasks records  
- Deletes group record
- Refreshes the dashboard
```

**UI Changes**:
- Group cards now display delete button in top-right corner
- Button appears on hover with smooth transitions
- Stop propagation prevents opening group when clicking delete

---

## 2. 📊 Task Status with Pending/Completed/Expired

**Location**: TaskList.jsx

**Status Types**:
- **✓ Completed** (Green badge) - Task marked as completed
- **⏳ Pending** (Yellow badge) - Task not yet due, awaiting submission
- **⚠️ Expired** (Red badge) - Task due date passed, not completed

**Status Logic**:
```dart
getTaskStatus(task):
- If status === "completed" → return "completed"
- If due_date < today AND status !== "completed" → return "expired"
- Else → return "pending"
```

**UI Enhancements**:
- Status badges with color-coded styling
- New "Document" column showing document submission status (✓ Yes / ✗ No)
- Improved table styling with hover effects
- Better visual hierarchy with proper spacing

**Database Columns Used**:
- `status`: Task completion status (pending/completed)
- `due_date`: Task due date for expiration check
- `document_submitted`: Boolean flag for document submission tracking

---

## 3. 📢 Document Reminders & Notifications

**Location**: Notifications.jsx (New Component)

**Integrated Into**: GroupDetails.jsx

**Features**:
- Automatic detection of overdue tasks without submitted documents
- Creates notifications for tasks due within 24 hours
- Prevents duplicate notifications
- Unread/Read status tracking
- Mark as read and dismiss functionality
- Hourly check for new notifications

**Notification Types**:
- **Document Due Soon**: Tasks due within 1 day that haven't been submitted
- Triggers when: Task is pending AND document_submitted = false AND due_date is within 24 hours

**Notification Display**:
- Lists all overdue document reminders
- Shows task title, group name, due date
- Visual distinction for unread notifications (amber background)
- Timestamp of notification creation
- Action buttons: "Mark Read" and "Dismiss"

**Background Process**:
```javascript
- Runs every hour automatically
- Checks for tasks due within 24 hours
- Creates notifications only once per task/user
- Prevents duplicate notification creation
```

**Database Schema Required**:
- `notifications` table with:
  - `id`: Primary key
  - `task_id`: Reference to task
  - `user_id`: Reference to user/member
  - `type`: Notification type (document_overdue)
  - `title`: Notification title
  - `message`: Notification message
  - `is_read`: Read status flag
  - `created_at`: Creation timestamp

---

## Database Schema Updates

### Tasks Table - Required Columns

The following columns must exist in the `tasks` table:

```sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS document_submitted BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id);
```

### Notifications Table - Create New

```sql
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) DEFAULT 'document_overdue',
  title VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

See `docs/notifications_schema.sql` for complete SQL with indexes and RLS policies.

---

## Component Structure

```
AdminDashboard.jsx
  └── handleDeleteGroup() [NEW]
      └── Cascading deletes for members and tasks

GroupDetails.jsx
  ├── TaskList.jsx [UPDATED]
  │   ├── getTaskStatus() [NEW]
  │   ├── getStatusBadge() [NEW]
  │   └── hasSubmittedDocument() [NEW]
  │
  └── Notifications.jsx [NEW]
      ├── checkAndCreateNotifications() [NEW]
      ├── loadNotifications() [NEW]
      ├── markAsRead() [NEW]
      └── dismissNotification() [NEW]
```

---

## Testing Checklist

### Delete Group Feature
- [ ] Navigate to Admin Dashboard
- [ ] Click 🗑️ icon on any group card
- [ ] Confirm deletion in dialog
- [ ] Verify group disappears from list
- [ ] Verify all members and tasks deleted from database
- [ ] Cancel deletion (should not delete)

### Task Status Feature
- [ ] Create multiple tasks with different due dates
- [ ] Mark some as completed
- [ ] Set one task due date to past (should show Expired)
- [ ] Set one task due date to future (should show Pending)
- [ ] Verify color-coded badges display correctly:
  - Green for Completed ✓
  - Yellow for Pending ⏳
  - Red for Expired ⚠️
- [ ] Verify document submission status column

### Notifications Feature
- [ ] Create task due tomorrow without document submitted
- [ ] Navigate to group details
- [ ] Check "Document Reminders" section
- [ ] Should show notification with task details
- [ ] Click "Mark Read" - should change appearance
- [ ] Click "Dismiss" - should remove notification
- [ ] Create task due in 3 days - should not show notification yet
- [ ] Create task due yesterday - should show notification if not completed

---

## Files Modified

1. **tasknity-web/src/admin/AdminDashboard.jsx**
   - Added `handleDeleteGroup()` function
   - Updated group card rendering to include delete button
   - Added cascading delete logic

2. **tasknity-web/src/admin/GroupDetails.jsx**
   - Added import for Notifications component
   - Added Notifications section in UI

3. **tasknity-web/src/admin/TaskList.jsx**
   - Added status calculation logic
   - Added status badge rendering
   - Enhanced table with document submission column
   - Improved styling and visual hierarchy

4. **tasknity-web/src/admin/Notifications.jsx** [NEW]
   - Created new Notifications component
   - Implemented hourly background checks
   - Duplicate notification prevention
   - Mark as read / Dismiss functionality

5. **docs/notifications_schema.sql** [NEW]
   - SQL schema for notifications table
   - Indexes and RLS policies
   - Instructions for task table updates

---

## User Flow Example

### Scenario: Document Due in 24 Hours

1. Admin creates task "Submit Report" due tomorrow
2. Admin marks `document_submitted = false` initially
3. Notifications system runs (hourly)
4. Creates notification: "Document Due Soon: Submit Report"
5. Admin sees notification in "Document Reminders" section
6. Admin can:
   - Mark Read (if accidentally dismissed)
   - Dismiss (acknowledge the reminder)
7. If member submits document → document_submitted = true → no more notifications
8. If task passes due date → Status changes to "⚠️ Expired"

---

## Next Steps (Optional Enhancements)

1. **Email Notifications**: Send email to members when notification created
2. **SMS Alerts**: Send SMS reminder for urgent overdue documents
3. **Notification Bell**: Add notification bell icon in navbar showing count
4. **Bulk Actions**: Delete multiple groups or tasks at once
5. **Task Completion Verification**: Admin review before marking complete
6. **Late Submission Penalties**: Track how late submissions are
7. **Archive Groups**: Soft delete instead of hard delete for completed groups
8. **Notification Preferences**: Let members control notification frequency

---

## Notes

- Hot reload enabled: Changes automatically reflect in browser
- Cascading deletes: Deleting a group also deletes all related data
- Notifications check hourly: Background job runs automatically
- Status is calculated in real-time based on due date and current date
- All changes are backward compatible with existing data

