import React from "react";
import GroupForm from "./GroupForm";
import GroupList from "./GroupList";

export default function AdminPanel({
  role,
  addGroup,
  approveGroup,
  assignLeader,
  groups,
}) {
  return (
    <main>
      {role === "admin" ? (
        <>
          <GroupForm addGroup={addGroup} />
          <GroupList
            groups={groups}
            approveGroup={approveGroup}
            assignLeader={assignLeader}
            role={role}
          />
        </>
      ) : (
        <p className="info">Only Admins can manage groups.</p>
      )}
    </main>
  );
}
