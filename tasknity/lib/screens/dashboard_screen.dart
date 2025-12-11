import 'package:flutter/material.dart';

class DashboardScreen extends StatefulWidget {
  final String userRole;
  final String userName;

  // Constructor requires these two variables
  const DashboardScreen({
    super.key, 
    required this.userRole, 
    required this.userName
  });

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  // Mock Data
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
          "issueReported": false,
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
      "tasks": [],
      "approved": false, // Needs admin approval
    }
  ];

  List<String> notifications = [];

  @override
  void initState() {
    super.initState();
    // Simulate notifications based on role
    if (widget.userRole == "Admin") {
      notifications.add("New group 'Dev Team' needs approval.");
    }
  }

  // --- ACTIONS ---

  void _signOut() {
    Navigator.pushReplacementNamed(context, '/login');
  }

  // Admin: Add Group
  void _addGroupDialog() {
    final nameCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final leaderCtrl = TextEditingController();
    
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Create Group'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Group Name')),
            TextField(controller: descCtrl, decoration: const InputDecoration(labelText: 'Description')),
            TextField(controller: leaderCtrl, decoration: const InputDecoration(labelText: 'Leader Name')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              setState(() {
                groups.add({
                  "id": DateTime.now().millisecondsSinceEpoch,
                  "name": nameCtrl.text,
                  "description": descCtrl.text,
                  "leader": leaderCtrl.text,
                  "members": [leaderCtrl.text],
                  "tasks": [],
                  "approved": true,
                });
              });
              Navigator.pop(context);
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  // Admin: Global Alert
  void _sendBroadcastAlert() {
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Alert sent to all groups!")));
  }

  // Leader: Add Task
  void _addTaskDialog(Map<String, dynamic> group) {
    final titleCtrl = TextEditingController();
    String assignedTo = group["members"].isNotEmpty ? group["members"][0] : widget.userName;

    showDialog(
      context: context,
      builder: (_) => StatefulBuilder(
        builder: (ctx, setDialogState) {
          return AlertDialog(
            title: const Text('Assign Task'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(controller: titleCtrl, decoration: const InputDecoration(labelText: 'Task Title')),
                const SizedBox(height: 10),
                DropdownButton<String>(
                  value: assignedTo,
                  isExpanded: true,
                  items: group["members"].map<DropdownMenuItem<String>>((m) => DropdownMenuItem(value: m, child: Text(m))).toList(),
                  onChanged: (val) => setDialogState(() => assignedTo = val!),
                ),
              ],
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    group["tasks"].add({
                      "title": titleCtrl.text,
                      "status": "Pending",
                      "assignedTo": assignedTo,
                      "dueDate": DateTime.now().add(const Duration(days: 3)),
                      "issueReported": false,
                    });
                  });
                  Navigator.pop(context);
                },
                child: const Text('Assign'),
              ),
            ],
          );
        }
      ),
    );
  }

  // Individual: Report Issue
  void _reportIssue(Map<String, dynamic> task) {
    setState(() {
      task["issueReported"] = true;
    });
    Navigator.pop(context); // Close task view
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Leader notified of difficulty.")));
  }

  // View Tasks Logic
  void _viewTasksDialog(Map<String, dynamic> group) {
    List tasks = group["tasks"];
    
    // Individuals only see their own tasks
    if (widget.userRole == "Individual") {
      tasks = tasks.where((t) => t["assignedTo"] == widget.userName).toList();
    }

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('${group["name"]} Tasks'),
        content: SizedBox(
          width: double.maxFinite,
          child: tasks.isEmpty 
          ? const Text("No tasks found.") 
          : ListView.builder(
            shrinkWrap: true,
            itemCount: tasks.length,
            itemBuilder: (ctx, i) {
              final t = tasks[i];
              return ListTile(
                title: Text(t["title"]),
                subtitle: Text("Status: ${t["status"]}"),
                trailing: widget.userRole == "Individual" 
                  ? IconButton(
                      icon: const Icon(Icons.report_problem, color: Colors.orange),
                      tooltip: "Report Difficulty",
                      onPressed: () => _reportIssue(t),
                    )
                  : null,
              );
            },
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
          if (widget.userRole == "ProjectLeader")
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _addTaskDialog(group);
              },
              child: const Text('Add Task'),
            )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Filter groups based on role
    List<Map<String, dynamic>> visibleGroups = groups;
    if (widget.userRole == "ProjectLeader") {
      visibleGroups = groups.where((g) => g["leader"] == widget.userName).toList();
    } else if (widget.userRole == "Individual") {
      visibleGroups = groups.where((g) => (g["members"] as List).contains(widget.userName)).toList();
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.userRole} Dashboard'),
        backgroundColor: widget.userRole == "Admin" ? Colors.blueGrey : Colors.indigo,
        foregroundColor: Colors.white,
        actions: [
          IconButton(onPressed: _signOut, icon: const Icon(Icons.logout)),
        ],
      ),
      body: ListView.builder(
        itemCount: visibleGroups.length,
        itemBuilder: (ctx, i) {
          final g = visibleGroups[i];

          // Admin Approval Logic
          if (widget.userRole == "Admin" && g["approved"] == false) {
            return Card(
              color: Colors.amber[50],
              margin: const EdgeInsets.all(8),
              child: ListTile(
                title: Text("${g["name"]} (Pending Approval)"),
                trailing: ElevatedButton(
                  onPressed: () => setState(() => g["approved"] = true),
                  child: const Text("Approve"),
                ),
              ),
            );
          }

          if (g["approved"] == false) return const SizedBox.shrink();

          return Card(
            margin: const EdgeInsets.all(8),
            child: ListTile(
              title: Text(g["name"]),
              subtitle: Text(g["description"]),
              trailing: IconButton(
                icon: const Icon(Icons.visibility),
                onPressed: () => _viewTasksDialog(g),
              ),
            ),
          );
        },
      ),
      floatingActionButton: widget.userRole == "Admin"
        ? FloatingActionButton(
            onPressed: _addGroupDialog,
            child: const Icon(Icons.add),
          )
        : null,
    );
  }
}