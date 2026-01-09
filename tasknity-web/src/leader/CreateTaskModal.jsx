await supabase.from("tasks").insert({
  title,
  description,
  group_id: groupId,
  assigned_to: memberId,
  status: "pending",
  issued_at: new Date(),
  due_date,
  created_by: user.id,
});
