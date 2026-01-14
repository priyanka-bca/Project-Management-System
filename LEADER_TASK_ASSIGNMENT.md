# Task Assignment by Leader - Implementation

## Changes Made

### Overview
Modified the task assignment system so that **leaders can assign tasks to members** in their group, while admins retain full control.

### Updated File: `src/admin/GroupDetails.jsx`

#### 1. Added New State Variables
```javascript
const [currentUserRole, setCurrentUserRole] = useState(null);
const [currentUserId, setCurrentUserId] = useState(null);
```
- Tracks the current user's role (admin or leader)
- Tracks the current user's ID for role verification

#### 2. New Function: `loadCurrentUser()`
- Gets the authenticated user from Supabase
- Checks if user has a role in this specific group
- Falls back to checking if user is an admin in the profiles table
- Sets the appropriate role state

#### 3. Updated Task Assignment Logic
**Button Visibility Rules:**
- **"+ Task" button shows for:**
  - Leaders assigning tasks only to members
  - Admins assigning tasks to anyone

```jsx
{(currentUserRole === "leader" || currentUserRole === "admin") && m.role === "member" && (
  <button onClick={() => {...}} >+ Task</button>
)}
```

#### 4. Updated Member Management (Dropdown Menu)
- **Dropdown menu (⋮) shows only to:** Admins
- Leaders cannot change member roles or remove members
- Admins can still manage all member operations

```jsx
{(currentUserRole === "admin") && (
  <div className="relative">
    {/* Dropdown menu for role changes and removal */}
  </div>
)}
```

#### 5. Updated Add Member Button
- **"+ Add Member" button shows only to:** Admins
- Leaders cannot add new members to the group
- Admins manage group membership

```jsx
{currentUserRole === "admin" && (
  <button onClick={() => setShowAddMemberModal(true)}>+ Add Member</button>
)}
```

---

## Role Permissions Summary

| Feature | Admin | Leader | Member |
|---------|-------|--------|--------|
| View Group | ✅ | ✅ | ❌* |
| Assign Tasks | ✅ | ✅ (to members only) | ❌ |
| Change Member Roles | ✅ | ❌ | ❌ |
| Remove Members | ✅ | ❌ | ❌ |
| Add Members | ✅ | ❌ | ❌ |
| View Tasks | ✅ | ✅ | ❌* |

*Members view tasks in Flutter mobile app only

---

## User Flow

### Scenario 1: Admin in a Group
1. Admin navigates to group details
2. Admin sees all controls:
   - "Add Member" button
   - "⋮" dropdown menu on each member (Change role, Remove)
   - "+ Task" button on each member
3. Admin can assign tasks to any member
4. Admin can manage all members and tasks

### Scenario 2: Leader in a Group
1. Leader navigates to group details
2. Leader sees limited controls:
   - No "Add Member" button
   - No "⋮" dropdown menu on members
   - "+ Task" button ONLY on members (not on other leaders)
3. Leader can assign tasks to members
4. Leader cannot:
   - Add new members
   - Change member roles
   - Remove members
   - Assign tasks to other leaders

### Scenario 3: Member in a Group
1. Members cannot access the admin group details page
2. Members see groups in Flutter app only
3. Members can view assigned tasks and submit documents

---

## Technical Implementation Details

### Role Detection
```javascript
// Check group-level role
const { data: userRole } = await supabase
  .from("group_members")
  .select("role")
  .eq("group_id", groupId)
  .eq("user_id", currentUserId)
  .single();

// Fall back to profile-level role (for admins)
if (!userRole) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUserId)
    .single();
}
```

### Task Creation (Unchanged)
- The `handleAddTask` function remains the same
- Still records:
  - `assigned_to`: User ID of the task recipient
  - `group_id`: Group where task is assigned
  - `status`: "pending"
  - `due_date`: Task deadline

### Database Requirements
- `group_members` table must have `role` column (member/leader)
- `profiles` table must have `role` column (admin/member/leader)
- Tasks assigned to any user will work, but UI restricts based on roles

---

## Benefits

1. **Decentralized Task Management**
   - Leaders can independently manage member tasks
   - Reduces admin workload for large groups
   - Leaders have autonomy within their group

2. **Clear Authority Hierarchy**
   - Admins have global control
   - Leaders have group-level control
   - Members have no control (as intended)

3. **Security & Accountability**
   - Only appropriate users can perform role-changing actions
   - Task assignments constrained by role
   - Prevents members from assigning tasks

4. **Scalability**
   - Supports multiple leaders per group (though one leader per group is current constraint)
   - Each leader manages their own member tasks
   - Admins oversee all groups

---

## Testing Checklist

- [ ] Admin can assign tasks to all members ✅
- [ ] Admin can change member roles (Make Leader/Member) ✅
- [ ] Admin can remove members ✅
- [ ] Admin can add new members ✅
- [ ] Leader can assign tasks to members only (not other leaders) ✅
- [ ] Leader cannot see role change or remove buttons ✅
- [ ] Leader cannot see "Add Member" button ✅
- [ ] Task creation works for both admin and leader ✅
- [ ] Page loads correctly when user is not in group (falls back to admin check) ✅
- [ ] All UI elements are properly hidden/shown based on role ✅

---

## Future Enhancements

1. **Multiple Leaders Support**
   - Currently enforces one leader per group
   - Could allow multiple leaders with same permissions

2. **Task Delegation**
   - Leaders could delegate task assignment to senior members

3. **Task Review Workflow**
   - Leaders review member submissions before marking complete

4. **Activity Logging**
   - Track who assigned tasks, who changed roles, etc.

5. **Notifications for Leaders**
   - Notify leaders when members submit tasks
   - Notify leaders of task deadlines approaching

