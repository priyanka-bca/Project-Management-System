import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<Map<String, dynamic>> groups = [];
  bool _loading = true;

  // Replace this with token from login if you implement auth token storage
  String? token;

  @override
  void initState() {
    super.initState();
    _fetchGroups();
  }

  Future<void> _fetchGroups() async {
    setState(() => _loading = true);
    try {
      final url = Uri.parse("http://localhost:5000/groups");
      final response = await http.get(
        url,
        headers: {
          "Authorization": "Bearer $token", // must set after login
        },
      );

      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        groups = data.map((g) => Map<String, dynamic>.from(g)).toList();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              jsonDecode(response.body)['error'] ?? 'Failed to load groups',
            ),
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Error: $e")));
    } finally {
      setState(() => _loading = false);
    }
  }

  void _signOut() {
    Navigator.pushReplacementNamed(context, '/login');
  }

  Future<void> _addGroup(String name, String description) async {
    try {
      final url = Uri.parse("http://192.168.10.108:5000/groups");
      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token",
        },
        body: jsonEncode({"name": name, "description": description}),
      );

      if (response.statusCode == 200) {
        await _fetchGroups();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              jsonDecode(response.body)['error'] ?? "Failed to add group",
            ),
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Error: $e")));
    }
  }

  Future<void> _addTask(int groupId, String title, String status) async {
    try {
      final url = Uri.parse("http://192.168.10.108:5000/groups/$groupId/tasks");
      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token",
        },
        body: jsonEncode({"title": title, "status": status}),
      );

      if (response.statusCode == 200) {
        await _fetchGroups();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              jsonDecode(response.body)['error'] ?? "Failed to add task",
            ),
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Error: $e")));
    }
  }

  Future<void> _updateTask(int taskId, String status) async {
    try {
      final url = Uri.parse("http://192.168.10.108:5000/tasks/$taskId");
      final response = await http.patch(
        url,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token",
        },
        body: jsonEncode({"status": status}),
      );

      if (response.statusCode == 200) {
        await _fetchGroups();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              jsonDecode(response.body)['error'] ?? "Failed to update task",
            ),
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Error: $e")));
    }
  }

  void _showAddGroupDialog() {
    final nameController = TextEditingController();
    final descController = TextEditingController();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Add New Group"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(labelText: "Group Name"),
            ),
            const SizedBox(height: 12),
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
            onPressed: () async {
              if (nameController.text.trim().isEmpty) return;
              Navigator.pop(context);
              await _addGroup(
                nameController.text.trim(),
                descController.text.trim(),
              );
            },
            child: const Text("Add"),
          ),
        ],
      ),
    );
  }

  void _showAddTaskDialog(int groupId) {
    final titleController = TextEditingController();
    String status = "Pending";
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Add Task"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleController,
              decoration: const InputDecoration(labelText: "Task Title"),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: status,
              items: const [
                DropdownMenuItem(value: "Pending", child: Text("Pending")),
                DropdownMenuItem(
                  value: "In Progress",
                  child: Text("In Progress"),
                ),
                DropdownMenuItem(value: "Done", child: Text("Done")),
              ],
              onChanged: (v) => status = v!,
              decoration: const InputDecoration(labelText: "Status"),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () async {
              if (titleController.text.trim().isEmpty) return;
              Navigator.pop(context);
              await _addTask(groupId, titleController.text.trim(), status);
            },
            child: const Text("Add Task"),
          ),
        ],
      ),
    );
  }

  void _showTasksDialog(Map<String, dynamic> group) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text("Tasks - ${group['name']}"),
        content: SizedBox(
          width: 400,
          child: group["tasks"] == null || group["tasks"].isEmpty
              ? const Text("No tasks yet.")
              : Column(
                  mainAxisSize: MainAxisSize.min,
                  children: (group["tasks"] as List)
                      .map<Widget>(
                        (t) => ListTile(
                          title: Text(t["title"]),
                          subtitle: Text("Status: ${t["status"]}"),
                          trailing: DropdownButton<String>(
                            value: t["status"],
                            items: const [
                              DropdownMenuItem(
                                value: "Pending",
                                child: Text("Pending"),
                              ),
                              DropdownMenuItem(
                                value: "In Progress",
                                child: Text("In Progress"),
                              ),
                              DropdownMenuItem(
                                value: "Done",
                                child: Text("Done"),
                              ),
                            ],
                            onChanged: (v) => _updateTask(t["id"], v!),
                          ),
                        ),
                      )
                      .toList(),
                ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Close"),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _showAddTaskDialog(group["id"]);
            },
            child: const Text("Add Task"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Tasknity Dashboard"),
        actions: [
          IconButton(onPressed: _signOut, icon: const Icon(Icons.logout)),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchGroups,
              child: ListView.builder(
                itemCount: groups.length,
                itemBuilder: (context, index) {
                  final g = groups[index];
                  return Card(
                    margin: const EdgeInsets.all(10),
                    child: ListTile(
                      title: Text(g["name"]),
                      subtitle: Text(
                        '${g["description"]} • ${g["tasks"]?.length ?? 0} tasks',
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.visibility),
                        onPressed: () => _showTasksDialog(g),
                      ),
                    ),
                  );
                },
              ),
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddGroupDialog,
        child: const Icon(Icons.add),
      ),
    );
  }
}