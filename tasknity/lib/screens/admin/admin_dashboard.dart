import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'group_details.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  final supabase = Supabase.instance.client;

  bool loading = true;
  List groups = [];
  List users = [];

  @override
  void initState() {
    super.initState();
    fetchData();
  }

  Future<void> fetchData() async {
    final groupsData = await supabase.from('groups').select('*');
    final usersData = await supabase.from('profiles').select('*');

    setState(() {
      groups = groupsData;
      users = usersData;
      loading = false;
    });
  }

  void _showCreateGroupDialog(BuildContext context) {
    String groupName = '';
    String projectName = '';

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create Group'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              decoration: const InputDecoration(labelText: 'Group Name'),
              onChanged: (v) => groupName = v,
            ),
            const SizedBox(height: 10),
            TextField(
              decoration: const InputDecoration(labelText: 'Project Name'),
              onChanged: (v) => projectName = v,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              if (groupName.isNotEmpty && projectName.isNotEmpty) {
                await supabase.from('groups').insert({
                  'name': groupName,
                  'project_name': projectName,
                });
                fetchData(); // Refresh the list
                Navigator.pop(context);
              }
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Admin Dashboard"),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await supabase.auth.signOut();
              if (mounted) setState(() {});
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreateGroupDialog(context),
        tooltip: 'Create Group',
        child: const Icon(Icons.add),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: fetchData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Groups",
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 10),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: groups.length,
                      itemBuilder: (context, index) {
                        final group = groups[index];
                        return Card(
                          child: ListTile(
                            title: Text(group['name'] ?? 'Unknown Group'),
                            subtitle: Text(group['project_name'] ?? ""),
                            onTap: () {
                              final groupId = group['id'] ?? group['group_id'];
                              if (groupId != null) {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => GroupDetails(groupId: groupId),
                                  ),
                                );
                              }
                            },
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      "Users",
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 10),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: users.length,
                      itemBuilder: (context, index) {
                        final user = users[index];
                        return Card(
                          child: ListTile(
                            title: Text(user['email']),
                            subtitle: Text("Role: ${user['role']}"),
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