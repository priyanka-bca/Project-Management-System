import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'task_detail_dialog.dart';

class GroupDashboard extends StatefulWidget {
  const GroupDashboard({super.key});

  @override
  State<GroupDashboard> createState() => _GroupDashboardState();
}

class _GroupDashboardState extends State<GroupDashboard> {
  final supabase = Supabase.instance.client;
  String? userRole;
  String? selectedRole;
  String? selectedGroupId;
  String? groupRole; // Actual role in the selected group
  List<Map<String, dynamic>> groups = [];
  List<Map<String, dynamic>> tasks = [];
  List<Map<String, dynamic>> groupMembers = [];
  bool loading = true;

  int total = 0;
  int completed = 0;
  int pending = 0;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await _loadUserData();
  }

  Future<void> _loadUserData() async {
    try {
      final user = supabase.auth.currentUser;
      if (user == null) return;

      final prefs = await SharedPreferences.getInstance();
      final role = prefs.getString('role');

      print('User ID: ${user.id}, Role: $role');

      // Fetch user's groups
      List<dynamic> groupMemberships = [];
      try {
        groupMemberships = await supabase
            .from('group_members')
            .select('group_id')
            .eq('user_id', user.id);
        print('Group memberships found: $groupMemberships');
      } catch (e) {
        print('Error fetching group_members: $e');
      }

      List<Map<String, dynamic>> fetchedGroups = [];

      if (groupMemberships.isNotEmpty) {
        for (var membership in groupMemberships) {
          final groupId = membership['group_id'];
          print('Fetching group details for: $groupId');
          
          try {
            final groupData = await supabase
                .from('groups')
                .select('id, name, project_name')
                .eq('id', groupId)
                .maybeSingle();

            print('Group data for $groupId: $groupData');

            if (groupData != null) {
              fetchedGroups.add({
                'id': groupData['id'],
                'name': groupData['name'] ?? 'Unnamed',
                'project_name': groupData['project_name'] ?? '',
              });
            }
          } catch (e) {
            print('Error fetching group $groupId: $e');
          }
        }
      }

      print('Final fetched groups: $fetchedGroups, count: ${fetchedGroups.length}');

      if (!mounted) return;

      setState(() {
        userRole = role;
        selectedRole = role;
        groups = List<Map<String, dynamic>>.from(fetchedGroups);
        print('State updated - groups count: ${groups.length}, groups: $groups');
        if (groups.isNotEmpty) {
          selectedGroupId = groups[0]['id'];
          print('Selected first group: $selectedGroupId');
        }
        loading = false;
      });

      print('Loading set to false, groups.isEmpty: ${groups.isEmpty}');

      if (selectedGroupId != null) {
        await _fetchGroupRoleAndMembers();
        await _fetchTasks();
      }
    } catch (e) {
      print('Error loading data: $e');
      if (mounted) {
        setState(() => loading = false);
      }
    }
  }

  Future<void> _fetchGroupRoleAndMembers() async {
    try {
      final user = supabase.auth.currentUser;
      if (user == null || selectedGroupId == null) return;

      // Fetch user's role in this specific group
      final memberData = await supabase
          .from('group_members')
          .select('role')
          .eq('user_id', user.id)
          .eq('group_id', selectedGroupId!)
          .maybeSingle();

      String actualRole = memberData?['role'] ?? 'member';
      print('Actual group role: $actualRole');

      // Fetch all members in this group
      final membersData = await supabase
          .from('group_members')
          .select('user_id, role')
          .eq('group_id', selectedGroupId!);

      List<Map<String, dynamic>> membersList = [];
      for (var member in membersData) {
        final profileData = await supabase
            .from('profiles')
            .select('email, name, full_name, role')
            .eq('id', member['user_id'])
            .maybeSingle();

        if (profileData != null) {
          membersList.add({
            'user_id': member['user_id'],
            'email': profileData['email'],
            'name': profileData['name'] ?? profileData['full_name'] ?? 'Unknown',
            'group_role': member['role'],
          });
        }
      }

      if (!mounted) return;

      setState(() {
        groupRole = actualRole;
        selectedRole = actualRole;
        groupMembers = membersList;
      });
    } catch (e) {
      print('Error fetching group role/members: $e');
    }
  }

  Future<void> _fetchTasks() async {
    try {
      final user = supabase.auth.currentUser;
      if (user == null || selectedGroupId == null) return;

      List<Map<String, dynamic>> fetchedTasks = [];

      if (groupRole == 'leader') {
        final data = await supabase
            .from('tasks')
            .select()
            .eq('group_id', selectedGroupId!);
        fetchedTasks = List<Map<String, dynamic>>.from(data);
      } else {
        final data = await supabase
            .from('tasks')
            .select()
            .eq('assigned_to', user.id);
        fetchedTasks = List<Map<String, dynamic>>.from(data);
      }

      if (!mounted) return;

      setState(() {
        tasks = fetchedTasks;
        total = tasks.length;
        completed = tasks.where((t) => t['status'] == 'completed').length;
        pending = total - completed;
      });
    } catch (e) {
      print('Error fetching tasks: $e');
    }
  }

  void _switchRole(String newRole) {
    if (!['leader', 'member'].contains(newRole)) return;

    setState(() {
      selectedRole = newRole;
    });
    _fetchTasks();
  }

  Future<void> _showEditTaskDialog(Map<String, dynamic> task) async {
    final titleController = TextEditingController(text: task['title']);
    final descriptionController = TextEditingController(text: task['description']);
    String? selectedMemberId = task['assigned_to'];
    DateTime? selectedDeadline = task['due_date'] != null 
        ? DateTime.parse(task['due_date']) 
        : null;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Task'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleController,
                decoration: const InputDecoration(
                  labelText: 'Task Title',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 16),
              ListTile(
                title: Text(
                  selectedDeadline == null
                      ? 'Select Deadline'
                      : 'Deadline: ${selectedDeadline!.toLocal().toString().split(' ')[0]}',
                ),
                trailing: const Icon(Icons.calendar_today),
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: selectedDeadline ?? DateTime.now().add(const Duration(days: 7)),
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                  );
                  if (picked != null) {
                    selectedDeadline = picked;
                  }
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: selectedMemberId,
                decoration: const InputDecoration(
                  labelText: 'Assign to Member',
                  border: OutlineInputBorder(),
                ),
                items: groupMembers
                    .where((m) => m['group_role'] == 'member')
                    .map<DropdownMenuItem<String>>((member) => DropdownMenuItem<String>(
                          value: member['user_id'] as String,
                          child: Text(member['name'] ?? 'Unknown'),
                        ))
                    .toList(),
                onChanged: (value) {
                  selectedMemberId = value;
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                await supabase.from('tasks').update({
                  'title': titleController.text,
                  'description': descriptionController.text,
                  'assigned_to': selectedMemberId,
                  'due_date': selectedDeadline?.toIso8601String(),
                }).eq('id', task['id']);

                if (mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Task updated successfully')),
                  );
                  await _fetchTasks();
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e')),
                  );
                }
              }
            },
            child: const Text('Update Task'),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteTask(String taskId) async {
    try {
      await supabase.from('tasks').delete().eq('id', taskId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Task deleted successfully')),
        );
        await _fetchTasks();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  void _showAddTaskDialog() {
    final titleController = TextEditingController();
    final descriptionController = TextEditingController();
    String? selectedMemberId;
    DateTime? selectedDeadline;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Task'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleController,
                decoration: const InputDecoration(
                  labelText: 'Task Title',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 16),
              // Deadline Picker
              ListTile(
                title: Text(
                  selectedDeadline == null
                      ? 'Select Deadline'
                      : 'Deadline: ${selectedDeadline!.toLocal().toString().split(' ')[0]}',
                ),
                trailing: const Icon(Icons.calendar_today),
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: DateTime.now().add(const Duration(days: 7)),
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                  );
                  if (picked != null) {
                    selectedDeadline = picked;
                  }
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(
                  labelText: 'Assign to Member',
                  border: OutlineInputBorder(),
                ),
                items: groupMembers
                    .where((m) => m['group_role'] == 'member')
                    .map<DropdownMenuItem<String>>((member) => DropdownMenuItem<String>(
                          value: member['user_id'] as String,
                          child: Text(member['name'] ?? 'Unknown'),
                        ))
                    .toList(),
                onChanged: (value) {
                  selectedMemberId = value;
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (titleController.text.isEmpty ||
                  selectedMemberId == null ||
                  selectedDeadline == null) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Please fill all required fields'),
                  ),
                );
                return;
              }

              try {
                await supabase.from('tasks').insert({
                  'title': titleController.text,
                  'description': descriptionController.text,
                  'group_id': selectedGroupId,
                  'assigned_to': selectedMemberId,
                  'status': 'pending',
                  'due_date': selectedDeadline!.toIso8601String(),
                });

                if (mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Task created successfully'),
                    ),
                  );
                  await _fetchTasks();
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e')),
                  );
                }
              }
            },
            child: const Text('Add Task'),
          ),
        ],
      ),
    );
  }

  void _showTaskDetail(Map<String, dynamic> task) {
    showDialog(
      context: context,
      builder: (context) => TaskDetailDialog(
        task: task,
        onUploadSuccess: () {
          Navigator.pop(context);
          _fetchTasks();
        },
        groupLeaderId: groupMembers.firstWhere(
          (m) => m['group_role'] == 'leader',
          orElse: () => {},
        )['user_id'],
      ),
    );
  }

  void _switchGroup(String? groupId) {
    if (groupId == null) return;

    setState(() {
      selectedGroupId = groupId;
      loading = true;
    });

    _fetchGroupRoleAndMembers();
    _fetchTasks();
  }

  void _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await supabase.auth.signOut();
    await prefs.remove('token');
    await prefs.remove('role');
    if (mounted) {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text("Group Dashboard"),
        backgroundColor: Colors.blueGrey,
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
          ),
        ],
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : groups.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.group, size: 64, color: Colors.grey),
                        const SizedBox(height: 16),
                        const Text(
                          'No Groups Found',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'You are not a member of any groups yet.',
                          style: TextStyle(color: Colors.grey[600]),
                        ),
                      ],
                    ),
                  ),
                )
              : Padding(
                  padding: const EdgeInsets.all(16),
                  child: ListView(
                    children: [
                      // Group Selector
                      Card(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 2,
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Select Group:',
                                style: Theme.of(context).textTheme.labelMedium,
                              ),
                              const SizedBox(height: 8),
                              DropdownButton<String>(
                                isExpanded: true,
                                value: selectedGroupId,
                                items: groups
                                    .map<DropdownMenuItem<String>>((group) =>
                                        DropdownMenuItem<String>(
                                          value: group['id'] as String,
                                          child: Text(
                                            '${group['name']} (${group['project_name']})',
                                          ),
                                        ))
                                    .toList(),
                                onChanged: _switchGroup,
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      // Role Switcher
                      if (userRole == 'leader' || userRole == 'member')
                        Card(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 2,
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'View as:',
                                  style:
                                      Theme.of(context).textTheme.labelMedium,
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    Expanded(
                                      child: SegmentedButton<String>(
                                        segments: const [
                                          ButtonSegment(
                                            value: 'member',
                                            label: Text('Member'),
                                          ),
                                          ButtonSegment(
                                            value: 'leader',
                                            label: Text('Leader'),
                                          ),
                                        ],
                                        selected: {selectedRole ?? 'member'},
                                        onSelectionChanged: (selected) {
                                          _switchRole(selected.first);
                                        },
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      const SizedBox(height: 20),
                      // Group Members Section
                      if (groupMembers.isNotEmpty)
                        Card(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 2,
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Group Members',
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleMedium
                                      ?.copyWith(fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 12),
                                ...groupMembers.map((member) => Padding(
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 8),
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            member['name'] ?? 'Unknown',
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                          Text(
                                            member['email'] ?? '',
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey[600],
                                            ),
                                          ),
                                        ],
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 12, vertical: 6),
                                        decoration: BoxDecoration(
                                          color: member['group_role'] ==
                                                  'leader'
                                              ? Colors.purple.withOpacity(0.2)
                                              : Colors.blue.withOpacity(0.2),
                                          borderRadius:
                                              BorderRadius.circular(20),
                                        ),
                                        child: Text(
                                          member['group_role']?.toUpperCase() ??
                                              'MEMBER',
                                          style: TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                            color: member['group_role'] ==
                                                    'leader'
                                                ? Colors.purple
                                                : Colors.blue,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                )),
                              ],
                            ),
                          ),
                        ),
                      const SizedBox(height: 20),
                      // Task Stats
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _buildStatCard(
                              'Total', total.toString(), Colors.blue),
                          _buildStatCard('Completed', completed.toString(),
                              Colors.green),
                          _buildStatCard('Pending', pending.toString(),
                              Colors.orange),
                        ],
                      ),
                      const SizedBox(height: 20),
                      // Tasks Header with Add Button
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            groupRole == 'leader' ? 'Group Tasks' : 'My Tasks',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (groupRole == 'leader')
                            ElevatedButton.icon(
                              onPressed: _showAddTaskDialog,
                              icon: const Icon(Icons.add),
                              label: const Text('Add Task'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.blue,
                                foregroundColor: Colors.white,
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      tasks.isEmpty
                          ? Center(
                              child: Padding(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 32),
                                child: Text(
                                  groupRole == 'leader'
                                      ? 'No tasks in this group yet'
                                      : 'No tasks assigned to you',
                                  style: TextStyle(
                                    color: Colors.grey[600],
                                    fontSize: 16,
                                  ),
                                ),
                              ),
                            )
                          : ListView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: tasks.length,
                              itemBuilder: (context, index) {
                                final task = tasks[index];
                                final dueDate = task['due_date'] != null 
                                    ? DateTime.parse(task['due_date'])
                                    : null;
                                final daysLeft = dueDate != null
                                    ? dueDate.difference(DateTime.now()).inDays
                                    : null;
                                final isUrgent = daysLeft != null && daysLeft <= 1 && task['document_submitted'] != true;
                                
                                return Card(
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  elevation: 1,
                                  color: isUrgent ? Colors.red.withOpacity(0.1) : null,
                                  child: ListTile(
                                    title: Text(
                                      task['title'] ?? 'Untitled',
                                      style: TextStyle(
                                        fontWeight: isUrgent ? FontWeight.bold : FontWeight.normal,
                                        color: isUrgent ? Colors.red : null,
                                      ),
                                    ),
                                    subtitle: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text('Status: ${task['status'] ?? 'pending'}'),
                                        if (dueDate != null)
                                          Text(
                                            'Due: ${dueDate.toLocal().toString().split(' ')[0]}' +
                                            (daysLeft != null ? ' ($daysLeft days left)' : ''),
                                            style: TextStyle(
                                              color: isUrgent ? Colors.red : Colors.grey,
                                              fontWeight: isUrgent ? FontWeight.bold : FontWeight.normal,
                                            ),
                                          ),
                                        if (selectedRole == 'leader' &&
                                            task['assigned_to'] != null)
                                          Text(
                                            'Progress: ${task['progress'] ?? 0}%',
                                            style: const TextStyle(fontSize: 12),
                                          ),
                                      ],
                                    ),
                                    trailing: groupRole == 'leader'
                                        ? PopupMenuButton(
                                            itemBuilder: (context) => [
                                              PopupMenuItem(
                                                child: const Text('Edit'),
                                                onTap: () => _showEditTaskDialog(task),
                                              ),
                                              PopupMenuItem(
                                                child: const Text('Delete'),
                                                onTap: () {
                                                  showDialog(
                                                    context: context,
                                                    builder: (ctx) => AlertDialog(
                                                      title: const Text('Delete Task?'),
                                                      content: const Text(
                                                        'Are you sure you want to delete this task?',
                                                      ),
                                                      actions: [
                                                        TextButton(
                                                          onPressed: () => Navigator.pop(ctx),
                                                          child: const Text('Cancel'),
                                                        ),
                                                        ElevatedButton(
                                                          onPressed: () {
                                                            Navigator.pop(ctx);
                                                            _deleteTask(task['id']);
                                                          },
                                                          style: ElevatedButton.styleFrom(
                                                            backgroundColor: Colors.red,
                                                          ),
                                                          child: const Text('Delete'),
                                                        ),
                                                      ],
                                                    ),
                                                  );
                                                },
                                              ),
                                            ],
                                          )
                                        : const Icon(Icons.arrow_forward_ios),
                                    onTap: () {
                                      _showTaskDetail(task);
                                    },
                                  ),
                                );
                              },
                            ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
