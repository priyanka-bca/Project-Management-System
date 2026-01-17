import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class NotificationsScreen extends StatefulWidget {
  final String userId;
  final VoidCallback onNotificationsViewed;

  const NotificationsScreen({
    super.key,
    required this.userId,
    required this.onNotificationsViewed,
  });

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final supabase = Supabase.instance.client;
  List<Map<String, dynamic>> notifications = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
  }

  Future<void> _fetchNotifications() async {
    try {
      List<Map<String, dynamic>> allNotifications = [];

      // Fetch deadline notifications from tasks
      final tasksData = await supabase
          .from('tasks')
          .select()
          .eq('assigned_to', widget.userId);

      for (var task in tasksData) {
        if (task['due_date'] != null && task['status'] != 'completed') {
          final dueDate = DateTime.parse(task['due_date']);
          final daysLeft = dueDate.difference(DateTime.now()).inDays;
          final hoursLeft = dueDate.difference(DateTime.now()).inHours;

          // Create notifications for tasks due within 1 day
          if (daysLeft <= 1 && daysLeft >= 0) {
            allNotifications.add({
              'id': task['id'],
              'title': task['title'],
              'type': 'deadline',
              'message': hoursLeft == 0
                  ? 'Task "${task['title']}" is due today!'
                  : 'Task "${task['title']}" is due tomorrow!',
              'daysLeft': daysLeft,
              'hoursLeft': hoursLeft,
              'createdAt': DateTime.now().toIso8601String(),
            });
          }
        }
      }

      // Fetch task change notifications
      try {
        final taskNotifications = await supabase
            .from('task_notifications')
            .select()
            .eq('user_id', widget.userId)
            .order('created_at', ascending: false);

        for (var notif in taskNotifications) {
          String notifMessage = '';
          String notifType = notif['notification_type'];

          if (notifType == 'task_created') {
            notifMessage = 'You have been assigned a new task: "${notif['task_title']}"';
          } else if (notifType == 'task_updated') {
            notifMessage = 'Task "${notif['task_title']}" has been updated';
          }

          allNotifications.add({
            'id': notif['id'],
            'title': notif['task_title'],
            'type': 'task_change',
            'notificationType': notifType,
            'message': notifMessage,
            'createdAt': notif['created_at'],
          });
        }
      } catch (e) {
        // task_notifications table might not exist yet
        print('Could not fetch task notifications: $e');
      }

      // Sort by most recent/urgent first
      allNotifications.sort((a, b) {
        // Deadline notifications first
        if (a['type'] == 'deadline' && b['type'] != 'deadline') return -1;
        if (a['type'] != 'deadline' && b['type'] == 'deadline') return 1;

        // Then by urgency/date
        DateTime aDate = DateTime.parse(a['createdAt'] as String);
        DateTime bDate = DateTime.parse(b['createdAt'] as String);
        return bDate.compareTo(aDate);
      });

      if (!mounted) return;
      setState(() {
        notifications = allNotifications;
        loading = false;
      });

      // Call the callback to mark as viewed
      widget.onNotificationsViewed();
    } catch (e) {
      print('Error fetching notifications: $e');
      if (mounted) {
        setState(() => loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F1419),
      appBar: AppBar(
        title: const Text(
          'Notifications',
          style: TextStyle(
            color: Colors.white,
            fontSize: 22,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: const Color(0xFF1F2734),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: loading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation(Color(0xFF00D4FF)),
              ),
            )
          : notifications.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 48),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: const Color(0xFF00D4FF).withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.notifications_off,
                            size: 64,
                            color: Color(0xFF00D4FF),
                          ),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'No Notifications',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'You\'re all caught up!',
                          style: TextStyle(color: Colors.grey[400], fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: notifications.length,
                  itemBuilder: (context, index) {
                    final notification = notifications[index];
                    final isDeadline = notification['type'] == 'deadline';
                    final isUrgent = isDeadline && notification['hoursLeft'] == 0;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: isUrgent
                              ? [
                                  const Color(0xFFEF4444).withOpacity(0.15),
                                  const Color(0xFFEF4444).withOpacity(0.05),
                                ]
                              : isDeadline
                                  ? [
                                      const Color(0xFFF59E0B).withOpacity(0.15),
                                      const Color(0xFFF59E0B).withOpacity(0.05),
                                    ]
                                  : [
                                      const Color(0xFF00D4FF).withOpacity(0.15),
                                      const Color(0xFF00D4FF).withOpacity(0.05),
                                    ],
                        ),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isUrgent
                              ? const Color(0xFFEF4444).withOpacity(0.3)
                              : isDeadline
                                  ? const Color(0xFFF59E0B).withOpacity(0.3)
                                  : const Color(0xFF00D4FF).withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: isUrgent
                                  ? const Color(0xFFEF4444).withOpacity(0.2)
                                  : isDeadline
                                      ? const Color(0xFFF59E0B).withOpacity(0.2)
                                      : const Color(0xFF00D4FF).withOpacity(0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(
                              isDeadline ? Icons.schedule : Icons.assignment,
                              color: isUrgent
                                  ? const Color(0xFFEF4444)
                                  : isDeadline
                                      ? const Color(0xFFF59E0B)
                                      : const Color(0xFF00D4FF),
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  notification['title'],
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  notification['message'],
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[400],
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          if (isUrgent)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFEF4444),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                'URGENT',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
