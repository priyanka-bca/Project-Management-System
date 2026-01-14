import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:fl_chart/fl_chart.dart';

class MemberDashboard extends StatefulWidget {
  const MemberDashboard({super.key});

  @override
  State<MemberDashboard> createState() => _MemberDashboardState();
}

class _MemberDashboardState extends State<MemberDashboard> {
  List<Map<String, dynamic>> tasks = [];
  bool loading = true;

  int total = 0;
  int completed = 0;
  int pending = 0;

  @override
  void initState() {
    super.initState();
    fetchTasks();
  }

  // =====================
  // FETCH TASKS
  // =====================
  Future<void> fetchTasks() async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return;

      final data = await Supabase.instance.client
          .from('tasks')
          .select()
          .eq('assigned_to', user.id);

      setState(() {
        tasks = List<Map<String, dynamic>>.from(data);
        total = tasks.length;
        completed = tasks.where((t) => t['status'] == 'completed').length;
        pending = total - completed;
        loading = false;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading tasks: $e')),
      );
      setState(() => loading = false);
    }
  }

  // =====================
  // CREATE TASK
  // =====================
  Future<void> addTask(String title, String description) async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return;

      await Supabase.instance.client.from('tasks').insert({
        'title': title,
        'description': description,
        'assigned_to': user.id,
        'status': 'pending',
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Task created successfully")),
      );
      fetchTasks();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $e")),
      );
    }
  }

  // =====================
  // UPDATE PROGRESS
  // =====================
  Future<void> updateProgress(String id, int progress) async {
    try {
      await Supabase.instance.client
          .from('tasks')
          .update({'progress': progress})
          .eq('id', id);
      fetchTasks();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $e")),
      );
    }
  }

  // =====================
  // DELETE TASK
  // =====================
  Future<void> deleteTask(String id) async {
    try {
      await Supabase.instance.client.from('tasks').delete().eq('id', id);
      fetchTasks();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $e")),
      );
    }
  }

  // =====================
  // ADD TASK DIALOG
  // =====================
  void showAddTaskDialog() {
    final titleController = TextEditingController();
    final descController = TextEditingController();

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Add Task"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleController,
              decoration: const InputDecoration(labelText: "Title"),
            ),
            TextField(
              controller: descController,
              decoration: const InputDecoration(labelText: "Description"),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () {
              addTask(titleController.text.trim(), descController.text.trim());
              Navigator.pop(context);
            },
            child: const Text("Create"),
          ),
        ],
      ),
    );
  }

  // =====================
  // PIE CHART
  // =====================
  Widget pieChart() {
    return PieChart(
      PieChartData(
        sections: [
          PieChartSectionData(
            value: completed.toDouble(),
            title: "Completed",
            color: Colors.green,
          ),
          PieChartSectionData(
            value: pending.toDouble(),
            title: "Pending",
            color: Colors.orange,
          ),
        ],
      ),
    );
  }

  // =====================
  // UI
  // =====================
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Member Dashboard"),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              final prefs = await SharedPreferences.getInstance();
              await Supabase.instance.client.auth.signOut();
              await prefs.remove('token');
              await prefs.remove('role');
              if (mounted && context.mounted) {
                Navigator.pushReplacementNamed(context, '/login');
              }
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: showAddTaskDialog,
        child: const Icon(Icons.add),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: fetchTasks,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _summary("Total", total, Colors.blue),
                        _summary("Completed", completed, Colors.green),
                        _summary("Pending", pending, Colors.orange),
                      ],
                    ),
                    const SizedBox(height: 20),
                    SizedBox(height: 200, child: pieChart()),
                    const SizedBox(height: 20),
                    const Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        "My Tasks",
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: tasks.length,
                      itemBuilder: (context, index) {
                        final task = tasks[index];
                        return Card(
                          child: ListTile(
                            title: Text(task['title']),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(task['description'] ?? ""),
                                Text("Status: ${task['status']}"),
                                Text("Progress: ${task['progress']}%"),
                              ],
                            ),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                DropdownButton<int>(
                                  value: task['progress'],
                                  items: const [
                                    DropdownMenuItem(
                                      value: 0,
                                      child: Text("0%"),
                                    ),
                                    DropdownMenuItem(
                                      value: 50,
                                      child: Text("50%"),
                                    ),
                                    DropdownMenuItem(
                                      value: 100,
                                      child: Text("100%"),
                                    ),
                                  ],
                                  onChanged: (v) =>
                                      updateProgress(task['id'], v!),
                                ),
                                IconButton(
                                  icon: const Icon(
                                    Icons.delete,
                                    color: Colors.red,
                                  ),
                                  onPressed: () => deleteTask(task['id']),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _summary(String label, int value, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Text(label),
            Text(
              value.toString(),
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
