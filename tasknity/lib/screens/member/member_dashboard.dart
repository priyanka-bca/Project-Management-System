import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:fl_chart/fl_chart.dart';

class MemberDashboard extends StatefulWidget {
  const MemberDashboard({super.key});

  @override
  State<MemberDashboard> createState() => _MemberDashboardState();
}

class _MemberDashboardState extends State<MemberDashboard> {
  final String baseUrl = "http://192.168.10.105:5000";

  List<Map<String, dynamic>> tasks = [];
  bool loading = true;

  int total = 0;
  int completed = 0;
  int pending = 0;

  String? token;

  @override
  void initState() {
    super.initState();
    init();
  }

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    token = prefs.getString("token");
    await fetchTasks();
  }

  // =====================
  // FETCH TASKS
  // =====================
  Future<void> fetchTasks() async {
    if (token == null) return;

    final response = await http.get(
      Uri.parse("$baseUrl/member/tasks"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
    );

    if (response.statusCode == 200) {
      tasks = List<Map<String, dynamic>>.from(jsonDecode(response.body));

      total = tasks.length;
      completed = tasks.where((t) => t['status'] == 'completed').length;
      pending = total - completed;
    }

    setState(() => loading = false);
  }

  // =====================
  // CREATE TASK
  // =====================
  Future<void> addTask(String title, String description) async {
    final response = await http.post(
      Uri.parse("$baseUrl/member/tasks"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
      body: jsonEncode({"title": title, "description": description}),
    );

    if (response.statusCode == 201) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Task created successfully")),
      );
      fetchTasks();
    } else {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("Failed to create task")));
    }
  }

  // =====================
  // UPDATE PROGRESS
  // =====================
  Future<void> updateProgress(String id, int progress) async {
    await http.patch(
      Uri.parse("$baseUrl/tasks/$id/progress"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
      body: jsonEncode({"progress": progress}),
    );
    fetchTasks();
  }

  // =====================
  // DELETE TASK
  // =====================
  Future<void> deleteTask(String id) async {
    await http.delete(
      Uri.parse("$baseUrl/tasks/$id"),
      headers: {"Authorization": "Bearer $token"},
    );
    fetchTasks();
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
      appBar: AppBar(title: const Text("Member Dashboard")),
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
