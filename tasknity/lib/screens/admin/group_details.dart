import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class GroupDetails extends StatefulWidget {
  final String groupId;
  const GroupDetails({super.key, required this.groupId});

  @override
  State<GroupDetails> createState() => _GroupDetailsState();
}

class _GroupDetailsState extends State<GroupDetails> {
  final supabase = Supabase.instance.client;

  bool loading = true;
  Map<String, dynamic>? group;
  List members = [];
  List tasks = [];

  @override
  void initState() {
    super.initState();
    fetchData();
  }

  Future<void> fetchData() async {
    final groupData = await supabase.from('groups').select('*').eq('id', widget.groupId).single();
    final membersData = await supabase.from('group_members').select('*, profiles(*)').eq('group_id', widget.groupId);
    final tasksData = await supabase.from('tasks').select('*').eq('group_id', widget.groupId);

    setState(() {
      group = groupData;
      members = membersData;
      tasks = tasksData;
      loading = false;
    });
  }

  void _showAssignMemberDialog(BuildContext context) {
    String email = '';
    String role = 'member';

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Assign Member'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              decoration: const InputDecoration(labelText: 'Email'),
              onChanged: (v) => email = v,
            ),
            DropdownButtonFormField<String>(
              initialValue: role,
              items: const [
                DropdownMenuItem(value: 'member', child: Text('Member')),
                DropdownMenuItem(value: 'leader', child: Text('Leader')),
              ],
              onChanged: (v) => setState(() => role = v!),
              decoration: const InputDecoration(labelText: 'Role'),
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
              if (email.isNotEmpty) {
                final currentUser = supabase.auth.currentUser;
                
                // Prevent admin from adding themselves
                if (currentUser?.email != null && currentUser!.email!.toLowerCase() == email.toLowerCase()) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('You cannot add yourself to the group')),
                    );
                  }
                  Navigator.pop(context);
                  return;
                }
                
                // Check if user exists in profiles
                final user = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
                if (user != null) {
                  // Check if already in group
                  final existing = await supabase.from('group_members').select('id').eq('group_id', widget.groupId).eq('user_id', user['id']).maybeSingle();
                  if (existing == null) {
                    await supabase.from('group_members').insert({
                      'group_id': widget.groupId,
                      'user_id': user['id'],
                      'role': role,
                    });
                    fetchData(); // Refresh
                    Navigator.pop(context);
                  } else {
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('User already in group')),
                      );
                    }
                    Navigator.pop(context);
                  }
                } else {
                  // Invite via email
                  await supabase.from('group_invites').insert({
                    'email': email,
                    'group_id': widget.groupId,
                    'role': role,
                  });
                  Navigator.pop(context);
                }
              }
            },
            child: const Text('Assign'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(group?['name'] ?? 'Group Details')),
      floatingActionButton: FloatingActionButton(
        child: const Icon(Icons.person_add),
        onPressed: () => _showAssignMemberDialog(context),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Project: ${group?['project_name'] ?? ''}', style: const TextStyle(fontSize: 18)),
                  const SizedBox(height: 20),
                  const Text('Members', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: members.length,
                    itemBuilder: (context, index) {
                      final member = members[index];
                      return ListTile(
                        title: Text(member['profiles']['email']),
                        subtitle: Text('Role: ${member['role']}'),
                      );
                    },
                  ),
                  const SizedBox(height: 20),
                  const Text('Tasks', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: tasks.length,
                    itemBuilder: (context, index) {
                      final task = tasks[index];
                      return ListTile(
                        title: Text(task['title']),
                        subtitle: Text('Status: ${task['status']}'),
                      );
                    },
                  ),
                ],
              ),
            ),
    );
  }
}