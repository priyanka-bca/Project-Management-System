import 'package:flutter/material.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  // Dummy data — will be replaced with API calls later
  List<Map<String, dynamic>> groups = [
    {
      "id": 1,
      "name": "Design Team",
      "description": "UI/UX and branding",
      "tasks": [
        {"title": "Design new logo", "status": "In Progress"},
        {"title": "Prepare color palette", "status": "Pending"},
      ]
    },
    {
      "id": 2,
      "name": "Dev Team",
      "description": "Frontend & Backend",
      "tasks": [
        {"title": "Set up database schema", "status": "Done"},
        {"title": "Build login screen", "status": "In Progress"},
      ]
    }
  ];

  void _signOut() {
    Navigator.pushReplacementNamed(context, '/login');
  }

void _addGroupDialog() {
  final nameController = TextEditingController();
  final descController = TextEditingController();

  showDialog(
    context: context,
    builder: (_) => AlertDialog(
      title: const Text('Add New Group'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: nameController,
            decoration: const InputDecoration(
              labelText: 'Group name',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: descController,
            decoration: const InputDecoration(
              labelText: 'Description',
              border: OutlineInputBorder(),
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: () {
            if (nameController.text.trim().isEmpty) return;

            setState(() {
              groups.add({
                "id": DateTime.now().millisecondsSinceEpoch,
                "name": nameController.text.trim(),
                "description": descController.text.trim(),
                "tasks": []
              });
            });

            Navigator.pop(context); // close dialog

            // SnackBar to show group added
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Group "${nameController.text}" added!'),
                duration: const Duration(seconds: 2),
              ),
            );
          },
          child: const Text('Add'),
        ),
      ],
    ),
  );
}


  void _addTaskDialog(Map<String, dynamic> group) {
    final titleController = TextEditingController();
    String selectedStatus = "Pending";

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('Add Task to ${group["name"]}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleController,
              decoration: const InputDecoration(
                  labelText: 'Task title', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: selectedStatus,
              decoration: const InputDecoration(
                  labelText: 'Status', border: OutlineInputBorder()),
              items: const [
                DropdownMenuItem(value: "Pending", child: Text("Pending")),
                DropdownMenuItem(
                    value: "In Progress", child: Text("In Progress")),
                DropdownMenuItem(value: "Done", child: Text("Done")),
              ],
              onChanged: (value) {
                selectedStatus = value!;
              },
            ),
          ],
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel')),
          ElevatedButton(
              onPressed: () {
                if (titleController.text.trim().isEmpty) return;
                setState(() {
                  group["tasks"].add({
                    "title": titleController.text.trim(),
                    "status": selectedStatus
                  });
                });
                Navigator.pop(context);
              },
              child: const Text('Add Task'))
        ],
      ),
    );
  }

  void _viewTasksDialog(Map<String, dynamic> group) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('${group["name"]} — Tasks'),
        content: SizedBox(
          width: 400,
          child: group["tasks"].isEmpty
              ? const Text("No tasks yet.")
              : Column(
                  mainAxisSize: MainAxisSize.min,
                  children: group["tasks"].map<Widget>((task) {
                    return Card(
                      margin: const EdgeInsets.symmetric(vertical: 4),
                      child: ListTile(
                        title: Text(task["title"]),
                        subtitle: Text("Status: ${task["status"]}"),
                        trailing: PopupMenuButton<String>(
                          onSelected: (newStatus) {
                            setState(() {
                              task["status"] = newStatus;
                            });
                            Navigator.pop(context);
                            _viewTasksDialog(group); // reopen updated
                          },
                          itemBuilder: (_) => const [
                            PopupMenuItem(
                                value: "Pending", child: Text("Pending")),
                            PopupMenuItem(
                                value: "In Progress",
                                child: Text("In Progress")),
                            PopupMenuItem(value: "Done", child: Text("Done")),
                          ],
                          child: const Icon(Icons.more_vert),
                        ),
                      ),
                    );
                  }).toList(),
                ),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close')),
          ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _addTaskDialog(group);
              },
              child: const Text('Add Task')),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
  title: const Text('Tasknity Dashboard 📝'), // added emoji
  actions: [
    IconButton(onPressed: _signOut, icon: const Icon(Icons.logout)),
  ],
),
      body: ListView.builder(
        itemCount: groups.length,
        itemBuilder: (context, i) {
          final g = groups[i];
          return Card(
            margin: const EdgeInsets.all(10),
            child: ListTile(
              title: Text(g["name"]),
             subtitle: Text('${g["description"]} • ${g["tasks"].length} tasks'),
              trailing: IconButton(
                icon: const Icon(Icons.visibility),
                onPressed: () => _viewTasksDialog(g),
                tooltip: "View Tasks",
              ),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
  onPressed: _addGroupDialog,
  label: const Text('Add Group'),
  icon: const Icon(Icons.add),
  tooltip: 'Click to create a new group', // added tooltip
),

    );
  }
}
