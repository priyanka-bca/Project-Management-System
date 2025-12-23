import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:fl_chart/fl_chart.dart';

class MemberDashboard extends StatefulWidget {
  const MemberDashboard({super.key});

  @override
  State<MemberDashboard> createState() => _MemberDashboardState();
}

class _MemberDashboardState extends State<MemberDashboard> {
  final supabase = Supabase.instance.client;

  List<Map<String, dynamic>> tasks = [];

  int total = 0;
  int completed = 0;
  int pending = 0;

  @override
  void initState() {
    super.initState();
    fetchTasks();
  }

  Future<void> fetchTasks() async {
    final user = supabase.auth.currentUser;
    if (user == null) return;

    final response = await supabase
        .from('tasks')
        .select()
        .eq('member_id', user.id)
        .order('created_at', ascending: false);

    tasks = List<Map<String, dynamic>>.from(response);

    total = tasks.length;
    completed = tasks.where((t) => t['status'] == 'completed').length;
    pending = tasks.where((t) => t['status'] != 'completed').length;

    setState(() {});
  }

  Future<void> addTask(String title, String description) async {
    final user = supabase.auth.currentUser;
    if (user == null) return;

    await supabase.from('tasks').insert({
      'title': title,
      'description': description,
      'status': 'pending',
      'member_id': user.id,
    });

    fetchTasks();
  }

  Future<void> updateStatus(String id, String status) async {
    await supabase.from('tasks').update({'status': status}).eq('id', id);

    fetchTasks();
  }

  Future<void> deleteTask(String id) async {
    await supabase.from('tasks').delete().eq('id', id);
    fetchTasks();
  }

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
              if (titleController.text.isNotEmpty) {
                addTask(titleController.text, descController.text);
                Navigator.pop(context);
              }
            },
            child: const Text("Save"),
          ),
        ],
      ),
    );
  }

  Widget summaryCard(String title, int value, Color color) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: SizedBox(
        width: 110,
        height: 90,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(title),
            const SizedBox(height: 6),
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

  Widget pieChart() {
    return PieChart(
      PieChartData(
        sectionsSpace: 2,
        centerSpaceRadius: 40,
        sections: [
          PieChartSectionData(
            value: completed.toDouble(),
            title: "Done",
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Member Dashboard")),
      floatingActionButton: FloatingActionButton(
        onPressed: showAddTaskDialog,
        child: const Icon(Icons.add),
      ),
      body: RefreshIndicator(
        onRefresh: fetchTasks,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  summaryCard("Total", total, Colors.blue),
                  summaryCard("Completed", completed, Colors.green),
                  summaryCard("Pending", pending, Colors.orange),
                ],
              ),
              const SizedBox(height: 20),
              SizedBox(height: 200, child: pieChart()),
              const SizedBox(height: 20),
              const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  "My Tasks",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 10),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: tasks.length,
                itemBuilder: (context, index) {
                  final task = tasks[index];

                  final status = task['status'] ?? 'pending';

                  return Card(
                    child: ListTile(
                      title: Text(task['title']),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(task['description'] ?? ''),
                          const SizedBox(height: 4),
                          Text(
                            "Status: $status",
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          DropdownButton<String>(
                            value: status,
                            items: const [
                              DropdownMenuItem(
                                value: 'pending',
                                child: Text('Pending'),
                              ),
                              DropdownMenuItem(
                                value: 'in_progress',
                                child: Text('In Progress'),
                              ),
                              DropdownMenuItem(
                                value: 'completed',
                                child: Text('Completed'),
                              ),
                            ],
                            onChanged: (value) {
                              if (value != null) {
                                updateStatus(task['id'], value);
                              }
                            },
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete, color: Colors.red),
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
}
