const { data } = await supabase
  .from("notifications")
  .select("*")
  .order("created_at", { ascending: false });
