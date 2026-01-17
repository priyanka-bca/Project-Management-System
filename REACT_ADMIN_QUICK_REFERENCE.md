# React Admin Quick Reference - Deadline Features

## What Changed?

React admin dashboard now matches Flutter with deadline enforcement features.

---

## Key Features Added

### 1. **Overdue Task Display**
- Tasks past deadline show with **red background** in task list
- **"Overdue" badge** appears next to due date
- Due dates are color-coded (red = overdue, gray = normal)

### 2. **Task Filtering**
Click filter buttons to view:
- 📋 **All Tasks** - Everything
- ⏳ **Pending** - Not completed, deadline not passed
- ⚠️ **Overdue** - Not completed, deadline passed  
- ✓ **Completed** - Finished tasks

### 3. **Enhanced Stats**
Dashboard now shows 4 metrics instead of 3:
- Total Tasks (blue)
- Pending (yellow)
- **Overdue (red)** ← NEW
- Completed (green)

### 4. **Notifications**
Already implemented:
- 📋 Document Due Soon (yellow/amber)
- ⚠️ Task Deadline Missed (red) ← Notifies group leader

---

## Component Changes

### TaskList.jsx
```jsx
// New props
<TaskList groupId={groupId} tasks={getFilteredTasks()} />

// Overdue visual indicators
- getDueDateColor(task) // Returns red for overdue
- isOverdue(task) // Checks if past deadline
```

### GroupDetails.jsx
```jsx
// New state
const [taskFilter, setTaskFilter] = useState("all");

// New function
const getFilteredTasks() // Returns filtered tasks array

// New computed values
const overdueTasks // Count of past-deadline tasks
```

---

## Filter Logic

```javascript
PENDING = (status != completed) AND (no_due_date OR due_date >= today)
OVERDUE = (status != completed) AND (due_date < today)
COMPLETED = status == completed
ALL = everything
```

---

## Date Handling

**Important**: Dates are compared at 00:00:00 (start of day)
- Today at 23:59 = NOT overdue yet
- Tomorrow at 00:00 = Still not overdue
- Yesterday at 00:00 = OVERDUE

---

## Testing the Features

### Test 1: View Overdue Tasks
1. Create task with past due date
2. Click "Overdue" filter
3. ✅ Task shows with red badge
4. ✅ Row background is light red

### Test 2: Filter Switching
1. Create mix of tasks (completed, pending, overdue)
2. Click each filter button
3. ✅ Task counts update
4. ✅ Only matching tasks shown
5. ✅ Empty state shows when no matches

### Test 3: Notifications
1. Create task due in 24 hours without document
2. Wait/refresh notifications
3. ✅ See "Document Due Soon" notification
4. ✅ Can mark as read or dismiss

### Test 4: Missed Deadline
1. Create task with past due date
2. Member doesn't upload document
3. ✅ Group leader sees "Task Deadline Missed" notification
4. ✅ Red color indicates urgency

---

## Color Reference

| Element | Color | Hex | Meaning |
|---------|-------|-----|---------|
| Overdue Badge | Red | #ef4444 | Past deadline |
| Overdue Row | Light Red | #fef2f2 | Container highlight |
| Overdue Stat | Red BG | #fee2e2 | Count indicator |
| Pending Stat | Yellow BG | #fef3c7 | Standard tasks |
| Completed Stat | Green BG | #f0fdf4 | Done tasks |

---

## Common Issues

### Issue: Overdue badge not showing
**Check:** Is `due_date` set correctly in database?  
**Check:** Is task status something other than "completed"?

### Issue: Filter button not responding
**Check:** Is `taskFilter` state updating? (Check browser console)  
**Check:** Are filtered tasks being passed to TaskList?

### Issue: Stats counts wrong
**Check:** Are all tasks loaded in state?  
**Check:** Is date comparison using correct timezone?

---

## Developer Notes

### Adding New Filter Type
1. Add case in `getFilteredTasks()` switch statement
2. Add button in filter button array
3. Update stat card if needed

### Changing Overdue Color
- Edit `getDueDateColor()` in TaskList.jsx
- Edit `isOverdue` row background in table render
- Edit `overdue` color in StatCard component

### Adjusting Filter Logic
- Edit date comparisons in `getFilteredTasks()`
- Ensure timezone handling stays consistent
- Test with edge cases (midnight transitions)

---

## Related Documentation

- Full implementation details: `REACT_ADMIN_SYNC_COMPLETE.md`
- Deadline enforcement guide: `DEADLINE_ENFORCEMENT_IMPLEMENTATION.md`
- Quick reference: `DEADLINE_ENFORCEMENT_QUICK_REFERENCE.md`

---

## Sync Status

| Component | Status | Last Updated |
|-----------|--------|---------------|
| TaskList.jsx | ✅ Synced | Jan 17, 2026 |
| GroupDetails.jsx | ✅ Synced | Jan 17, 2026 |
| Notifications.jsx | ✅ Synced | Jan 17, 2026 |
| Flutter | ✅ Reference | Jan 17, 2026 |

---

**Last Updated**: January 17, 2026  
**Status**: Production Ready ✅
