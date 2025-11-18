import 'package:flutter/material.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  String currentUserRole = "Admin"; // Can be Admin / ProjectLeader / Individual
  String currentUser = "Manisha"; // Current user name for assignment simulation

  List<Map<String, dynamic>> groups = [
    {
      "id": 1,
      "name": "Design Team",
      "description": "UI/UX and branding",
      "leader": "Alice",
      "members": ["Alice", "Bob", "Charlie"],
      "tasks": [
        {
          "title": "Design new logo",
          "status": "In Progress",
          "assignedTo": "Alice",
          "dueDate": DateTime.now().add(const Duration(days: 2)),
        },
        {
          "title": "Prepare color palette",
          "status": "Pending",
          "assignedTo": "Bob",
          "dueDate": DateTime.now().add(const Duration(days: -1)), // overdue
        },
      ],
      "approved": true,
    },
    {
      "id": 2,
      "name": "Dev Team",
      "description": "Frontend & Backend",
      "leader": "David",
      "members": ["David", "Eva", "Frank"],
      "tasks": [
        {
          "title": "Set up database schema",
          "status": "Done",
          "assignedTo": "David",
          "dueDate": DateTime.now().add(const Duration(days: 0)),
        },
        {
          "title": "Build login screen",
          "status": "In Progress",
          "assignedTo": "Eva",
          "dueDate": DateTime.now().add(const Duration(days: 1)),
        },
      ],
      "approved": true,
    }
  ];

  String filter = "All"; // Task filter

  // ---------------- SIGN OUT ----------------
  void _signOut() {
    Navigator.pushReplacementNamed(context, '/login');
  }

  // ---------------- ADD GROUP (Admin only) ----------------
  void _addGroupDialog() {
    if (currentUserRole != "Admin") return;

    final nameController = TextEditingController();
    final descController = TextEditingController();
    final leaderController = TextEditingController();
    final membersController = TextEditingController();

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Add New Group'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(
                    labelText: 'Group Name', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: descController,
                decoration: const InputDecoration(
                    labelText: 'Description', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: leaderController,
                decoration: const InputDecoration(
                    labelText: 'Leader Name', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: membersController,
                decoration: const InputDecoration(
                    labelText: 'Members (comma separated)',
                    border: OutlineInputBorder()),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
              onPressed: () {
                if (nameController.text.trim().isEmpty) return;
                setState(() {
                  groups.add({
                    "id": DateTime.now().millisecondsSinceEpoch,
                    "name": nameController.text.trim(),
                    "description": descController.text.trim(),
                    "leader": leaderController.text.trim(),
                    "members": membersController.text
                        .split(",")
                        .map((e) => e.trim())
                        .toList(),
                    "tasks": [],
                    "approved": false, // Needs admin approval
                  });
                });
                Navigator.pop(context);
              },
              child: const Text('Add')),
        ],
      ),
    );
  }

  // ---------------- ADD TASK ----------------
  void _addTaskDialog(Map<String, dynamic> group) {
    // Only Admin or ProjectLeader can add tasks
    if (!(currentUserRole == "Admin" || currentUserRole == "ProjectLeader")) return;

    final titleController = TextEditingController();
    final dueDateController = TextEditingController();
    String selectedStatus = "Pending";
    String assignedTo = group["members"].isNotEmpty ? group["members"][0] : currentUser;

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('Add Task to ${group["name"]}'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleController,
                decoration: const InputDecoration(
                    labelText: 'Task Title', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              DropdownButtonFormField<String>(
                value: assignedTo,
                decoration: const InputDecoration(
                    labelText: 'Assign To', border: OutlineInputBorder()),
                items: group["members"]
                    .map<DropdownMenuItem<String>>(
                        (m) => DropdownMenuItem(value: m, child: Text(m)))
                    .toList(),
                onChanged: (value) => assignedTo = value!,
              ),
              const SizedBox(height: 10),
              DropdownButtonFormField<String>(
                value: selectedStatus,
                decoration: const InputDecoration(
                    labelText: 'Status', border: OutlineInputBorder()),
                items: const [
                  DropdownMenuItem(value: "Pending", child: Text("Pending")),
                  DropdownMenuItem(value: "In Progress", child: Text("In Progress")),
                  DropdownMenuItem(value: "Done", child: Text("Done")),
                ],
                onChanged: (value) => selectedStatus = value!,
              ),
              const SizedBox(height: 10),
              TextField(
                controller: dueDateController,
                decoration: const InputDecoration(
                    labelText: 'Due Date (YYYY-MM-DD)',
                    border: OutlineInputBorder()),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              if (titleController.text.trim().isEmpty) return;
              DateTime dueDate = DateTime.tryParse(dueDateController.text) ??
                  DateTime.now().add(const Duration(days: 1));
              setState(() {
                group["tasks"].add({
                  "title": titleController.text.trim(),
                  "status": selectedStatus,
                  "assignedTo": assignedTo,
                  "dueDate": dueDate,
                });
              });
              Navigator.pop(context);
            },
            child: const Text('Add Task'),
          ),
        ],
      ),
    );
  }

  // ---------------- VIEW TASKS ----------------
  void _viewTasksDialog(Map<String, dynamic> group) {
    List tasks = group["tasks"];
    List filteredTasks = tasks.where((task) {
      if (filter == "All") return true;
      return task["status"] == filter;
    }).toList();

    int done = tasks.where((t) => t["status"] == "Done").length;
    int total = tasks.length;
    double progress = total == 0 ? 0 : done / total;

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('${group["name"]} — Tasks'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              LinearProgressIndicator(value: progress),
              const SizedBox(height: 6),
              Text("Completed: $done / $total"),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                children: [
                  ChoiceChip(
                      label: const Text("All"),
                      selected: filter == "All",
                      onSelected: (_) => setState(() => filter = "All")),
                  ChoiceChip(
                      label: const Text("Pending"),
                      selected: filter == "Pending",
                      onSelected: (_) => setState(() => filter = "Pending")),
                  ChoiceChip(
                      label: const Text("In Progress"),
                      selected: filter == "In Progress",
                      onSelected: (_) => setState(() => filter = "In Progress")),
                  ChoiceChip(
                      label: const Text("Done"),
                      selected: filter == "Done",
                      onSelected: (_) => setState(() => filter = "Done")),
                ],
              ),
              const SizedBox(height: 10),
              filteredTasks.isEmpty
                  ? const Text("No tasks in this filter.")
                  : Column(
                      mainAxisSize: MainAxisSize.min,
                      children: filteredTasks.map<Widget>((task) {
                        bool overdue = task["dueDate"].isBefore(DateTime.now()) &&
                            task["status"] != "Done";

                        return Card(
                          color: overdue ? Colors.red[50] : null,
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          child: ListTile(
                            title: Text(task["title"]),
                            subtitle: Text(
                                "Status: ${task["status"]} | Assigned: ${task["assignedTo"]} | Due: ${task["dueDate"].toString().split(' ')[0]}"),
                            trailing: PopupMenuButton<String>(
                              onSelected: (newStatus) {
                                setState(() {
                                  task["status"] = newStatus;
                                });
                                Navigator.pop(context);
                                _viewTasksDialog(group);
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
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
          if (currentUserRole != "Individual")
            ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  _addTaskDialog(group);
                },
                child: const Text('Add Task')),
        ],
      ),
    );

    // Notification for overdue tasks
    if (tasks.any((t) =>
        t["dueDate"].isBefore(DateTime.now()) && t["status"] != "Done")) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Some tasks are overdue!')));
    }
  }

  // ---------------- GROUP SUMMARY REPORT ----------------
  void _showGroupReport(Map<String, dynamic> group) {
    int total = group["tasks"].length;
    int pending = group["tasks"].where((t) => t["status"] == "Pending").length;
    int inProgress =
        group["tasks"].where((t) => t["status"] == "In Progress").length;
    int done = group["tasks"].where((t) => t["status"] == "Done").length;

    showDialog(
        context: context,
        builder: (_) => AlertDialog(
              title: Text("${group["name"]} Report"),
              content: Text(
                  "Leader: ${group["leader"]}\nMembers: ${group["members"].join(", ")}\nTotal Tasks: $total\nPending: $pending\nIn Progress: $inProgress\nDone: $done"),
              actions: [
                TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text("Close")),
              ],
            ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tasknity Dashboard'),
        actions: [
          IconButton(onPressed: _signOut, icon: const Icon(Icons.logout)),
        ],
      ),
      body: ListView.builder(
          itemCount: groups.length,
          itemBuilder: (context, i) {
            final g = groups[i];

            if (!g["approved"] && currentUserRole != "Admin") return const SizedBox();

            int pending =
                g["tasks"].where((t) => t["status"] == "Pending").length;
            int inProgress =
                g["tasks"].where((t) => t["status"] == "In Progress").length;
            int done = g["tasks"].where((t) => t["status"] == "Done").length;
            int total = g["tasks"].length;

            return Card(
              margin: const EdgeInsets.all(10),
              child: ListTile(
                title: Text(g["name"]),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(g["description"]),
                    const SizedBox(height: 4),
                    Text("Leader: ${g["leader"]}"),
                    Text(
                        "Tasks: $total | Pending: $pending | In Progress: $inProgress | Done: $done",
                        style: const TextStyle(fontSize: 12)),
                  ],
                ),
                trailing: Wrap(
                  spacing: 4,
                  children: [
                    IconButton(
                        icon: const Icon(Icons.visibility),
                        tooltip: "View Tasks",
                        onPressed: () => _viewTasksDialog(g)),
                    IconButton(
                        icon: const Icon(Icons.insert_chart),
                        tooltip: "Group Report",
                        onPressed: () => _showGroupReport(g)),
                  ],
                ),
              ),
            );
          }),
      floatingActionButton: currentUserRole == "Admin"
          ? FloatingActionButton.extended(
              onPressed: _addGroupDialog,
              label: const Text('Add Group'),
              icon: const Icon(Icons.add),
            )
          : null,
    );
  }
}
