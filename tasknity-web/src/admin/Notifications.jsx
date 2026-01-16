import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAndCreateNotifications();
    // Check every hour for new notifications
    const interval = setInterval(checkAndCreateNotifications, 3600000);
    return () => clearInterval(interval);
  }, []);

  const checkAndCreateNotifications = async () => {
    try {
      const today = new Date();
      
      // 1. Check for tasks due within 24 hours without documents
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: upcomingTasks, error: taskError } = await supabase
        .from("tasks")
        .select(`
          id,
          title,
          due_date,
          status,
          assigned_to,
          group_id,
          document_submitted,
          groups (
            name
          ),
          profiles (
            id,
            email,
            full_name
          )
        `)
        .eq("status", "pending")
        .eq("document_submitted", false)
        .lte("due_date", tomorrow.toISOString())
        .gte("due_date", today.toISOString());

      if (taskError) {
        console.error("Error fetching upcoming tasks:", taskError);
        return;
      }

      // 2. Check for tasks that have passed deadline without documents
      const { data: missedTasks, error: missedError } = await supabase
        .from("tasks")
        .select(`
          id,
          title,
          due_date,
          status,
          assigned_to,
          group_id,
          document_submitted,
          groups (
            name
          ),
          profiles (
            id,
            email,
            full_name
          )
        `)
        .eq("status", "pending")
        .eq("document_submitted", false)
        .lt("due_date", today.toISOString());

      if (missedError) {
        console.error("Error fetching missed tasks:", missedError);
        return;
      }

      // Get existing notifications to avoid duplicates
      const { data: existingNotifications } = await supabase
        .from("notifications")
        .select("task_id, user_id, type");

      const existingSet = new Set(
        existingNotifications?.map(n => `${n.task_id}-${n.user_id}-${n.type}`) || []
      );

      // Create notifications for upcoming tasks
      const newNotifications = [];
      for (const task of upcomingTasks || []) {
        const notificationKey = `${task.id}-${task.assigned_to}-document_overdue`;
        
        if (!existingSet.has(notificationKey)) {
          newNotifications.push({
            task_id: task.id,
            user_id: task.assigned_to,
            type: "document_overdue",
            title: `Document Due Soon: ${task.title}`,
            message: `Your task "${task.title}" in group "${task.groups?.name}" is due on ${new Date(task.due_date).toLocaleDateString()}. Please submit the document.`,
            is_read: false,
            created_at: new Date().toISOString(),
          });
        }
      }

      // Create notifications for missed deadline tasks (notify leader)
      for (const task of missedTasks || []) {
        const leaderId = task.group_id; // We'll need to get the actual leader ID
        
        // Get group leader ID
        const { data: groupData } = await supabase
          .from("groups")
          .select("created_by")
          .eq("id", task.group_id)
          .single();

        if (groupData?.created_by) {
          const notificationKey = `${task.id}-${groupData.created_by}-task_deadline_missed`;
          
          if (!existingSet.has(notificationKey)) {
            newNotifications.push({
              task_id: task.id,
              user_id: groupData.created_by,
              type: "task_deadline_missed",
              title: `Task Deadline Missed: ${task.title}`,
              message: `Member has not completed the task "${task.title}" in group "${task.groups?.name}" by the due date (${new Date(task.due_date).toLocaleDateString()}).`,
              is_read: false,
              created_at: new Date().toISOString(),
            });
          }
        }
      }

      if (newNotifications.length > 0) {
        const { error: insertError } = await supabase
          .from("notifications")
          .insert(newNotifications);

        if (insertError) {
          console.error("Error creating notifications:", insertError);
        }
      }

      // Fetch all unread notifications for the admin dashboard
      const user = await supabase.auth.getUser();
      if (user.data?.user) {
        loadNotifications(user.data.user.id);
      }
    } catch (error) {
      console.error("Error checking notifications:", error);
    }
  };

  const loadNotifications = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select(`
          id,
          task_id,
          type,
          title,
          message,
          is_read,
          created_at,
          tasks (
            id,
            title,
            due_date,
            assigned_to,
            groups (
              id,
              name
            ),
            profiles (
              full_name,
              email
            )
          )
        `)
        .in("type", ["document_overdue", "task_deadline_missed"])
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error) {
        setNotifications(data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      setNotifications(
        notifications.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const dismissNotification = async (notificationId) => {
    try {
      await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Error dismissing notification:", error);
    }
  };

  if (loading) {
    return <div className="text-gray-500 text-sm">Loading notifications...</div>;
  }

  if (notifications.length === 0) {
    return <div className="text-gray-500 text-sm">No pending notifications</div>;
  }

  const getNotificationBgColor = (type) => {
    if (type === "task_deadline_missed") {
      return "bg-red-50 border-red-300"; // Red for missed deadlines (urgent)
    }
    return "bg-amber-50 border-amber-300"; // Amber for upcoming documents
  };

  const getNotificationTypeLabel = (type) => {
    if (type === "task_deadline_missed") {
      return "⚠️ Missed Deadline";
    }
    return "📋 Document Due";
  };

  return (
    <div className="space-y-3">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`p-4 rounded-lg border flex items-start justify-between ${
            notif.is_read
              ? "bg-slate-50 border-slate-200"
              : getNotificationBgColor(notif.type)
          }`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 text-sm">{notif.title}</p>
              {!notif.is_read && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white">
                  {getNotificationTypeLabel(notif.type)}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
            <p className="text-xs text-slate-500 mt-2">
              {new Date(notif.created_at).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-2 ml-4">
            {!notif.is_read && (
              <button
                onClick={() => markAsRead(notif.id)}
                className={`text-xs text-white px-2 py-1 rounded hover:opacity-90 transition ${
                  notif.type === "task_deadline_missed"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-amber-500 hover:bg-amber-600"
                }`}
              >
                Mark Read
              </button>
            )}
            <button
              onClick={() => dismissNotification(notif.id)}
              className="text-xs bg-slate-300 text-slate-700 px-2 py-1 rounded hover:bg-slate-400 transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
