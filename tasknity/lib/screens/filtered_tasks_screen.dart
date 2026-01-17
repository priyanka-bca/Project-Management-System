import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'task_detail_dialog.dart';

class FilteredTasksScreen extends StatefulWidget {
  final String groupId;
  final String filterType; // 'all', 'completed', 'pending', 'overdue'
  final String? groupRole; // 'leader' or 'member'

  const FilteredTasksScreen({
    super.key,
    required this.groupId,
    required this.filterType,
    this.groupRole,
  });

  @override
  State<FilteredTasksScreen> createState() => _FilteredTasksScreenState();
}

class _FilteredTasksScreenState extends State<FilteredTasksScreen> {
  final supabase = Supabase.instance.client;
  List<Map<String, dynamic>> tasks = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _fetchTasks();
  }

  Future<void> _fetchTasks() async {
    try {
      final user = supabase.auth.currentUser;
      if (user == null) return;

      List<Map<String, dynamic>> fetchedTasks = [];

      // Use same logic as dashboard
      if (widget.groupRole == 'leader') {
        final data = await supabase
            .from('tasks')
            .select()
            .eq('group_id', widget.groupId);
        fetchedTasks = List<Map<String, dynamic>>.from(data);
      } else {
        // Default to member view or no role - show only assigned tasks
        final data = await supabase
            .from('tasks')
            .select()
            .eq('assigned_to', user.id);
        fetchedTasks = List<Map<String, dynamic>>.from(data);
      }

      if (!mounted) return;

      setState(() {
        tasks = fetchedTasks;
        loading = false;
      });
    } catch (e) {
      print('Error fetching tasks: $e');
      if (mounted) {
        setState(() => loading = false);
      }
    }
  }

  List<Map<String, dynamic>> _getFilteredTasks() {
    return tasks.where((task) {
      switch (widget.filterType) {
        case 'completed':
          return task['status'] == 'completed';
        case 'pending':
          final dueDate = task['due_date'] != null ? DateTime.parse(task['due_date']) : null;
          return task['status'] != 'completed' && (dueDate == null || dueDate.isAfter(DateTime.now()));
        case 'overdue':
          final dueDate = task['due_date'] != null ? DateTime.parse(task['due_date']) : null;
          return task['status'] != 'completed' && dueDate != null && dueDate.isBefore(DateTime.now());
        default: // 'all'
          return true;
      }
    }).toList();
  }

  String _getFilterTitle() {
    switch (widget.filterType) {
      case 'completed':
        return 'Completed Tasks';
      case 'pending':
        return 'Pending Tasks';
      case 'overdue':
        return 'Overdue Tasks';
      default:
        return 'All Tasks';
    }
  }

  Color _getFilterColor() {
    switch (widget.filterType) {
      case 'completed':
        return const Color(0xFF10B981);
      case 'pending':
        return const Color(0xFFF59E0B);
      case 'overdue':
        return const Color(0xFFEF4444);
      default:
        return const Color(0xFF00D4FF);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return Scaffold(
        appBar: AppBar(
          title: Text(_getFilterTitle()),
          backgroundColor: const Color(0xFF1F2734),
          elevation: 0,
        ),
        body: const Center(child: CircularProgressIndicator()),
        backgroundColor: const Color(0xFF0F1419),
      );
    }

    final filteredTasks = _getFilteredTasks();

    return Scaffold(
      backgroundColor: const Color(0xFF0F1419),
      appBar: AppBar(
        title: Text(
          _getFilterTitle(),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
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
      body: filteredTasks.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.task_alt,
                    size: 64,
                    color: _getFilterColor().withOpacity(0.5),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No ${widget.filterType} tasks',
                    style: const TextStyle(
                      fontSize: 18,
                      color: Colors.white,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: filteredTasks.length,
              itemBuilder: (context, index) {
                final task = filteredTasks[index];
                final dueDate = task['due_date'] != null
                    ? DateTime.parse(task['due_date'])
                    : null;

                return GestureDetector(
                  onTap: () {
                    showDialog(
                      context: context,
                      builder: (context) => TaskDetailDialog(
                        task: task,
                        onUploadSuccess: () {
                          _fetchTasks(); // Refresh tasks after update
                        },
                      ),
                    );
                  },
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF262F3D), Color(0xFF1F2734)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _getFilterColor().withOpacity(0.3),
                        width: 1.5,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                task['title'] ?? 'Untitled',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                  decoration: TextDecoration.none,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: _getStatusColor(task['status']).withOpacity(0.2),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                task['status']?.toUpperCase() ?? 'PENDING',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: _getStatusColor(task['status']),
                                ),
                              ),
                            ),
                          ],
                        ),
                        if (task['description'] != null && task['description'].isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Text(
                            task['description'],
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey[400],
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                        if (dueDate != null) ...[
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Icon(
                                Icons.calendar_today,
                                size: 14,
                                color: _getDueDateColor(dueDate),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Due: ${dueDate.toString().split(' ')[0]}',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: _getDueDateColor(dueDate),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(width: 8),
                              if (dueDate.isBefore(DateTime.now()) && task['status'] != 'completed')
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFEF4444).withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text(
                                    'Overdue',
                                    style: TextStyle(
                                      fontSize: 10,
                                      color: Color(0xFFEF4444),
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case 'completed':
        return const Color(0xFF10B981);
      case 'in_progress':
        return const Color(0xFF00D4FF);
      default:
        return const Color(0xFFF59E0B);
    }
  }

  Color _getDueDateColor(DateTime dueDate) {
    if (dueDate.isBefore(DateTime.now())) {
      return const Color(0xFFEF4444); // Overdue - red
    }
    return Colors.grey[400] ?? Colors.grey; // Normal - grey
  }
}
