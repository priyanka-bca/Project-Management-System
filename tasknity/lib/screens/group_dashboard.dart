import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'task_detail_dialog.dart';
import 'filtered_tasks_screen.dart';

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
  String taskFilter = 'all'; // Filter: all, completed, pending, overdue

  int total = 0;
  int completed = 0;
  int pending = 0;
  int overdue = 0;

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
        pending = tasks.where((t) => t['status'] != 'completed' && (t['due_date'] == null || DateTime.parse(t['due_date']).isAfter(DateTime.now()))).length;
        overdue = tasks.where((t) => t['status'] != 'completed' && t['due_date'] != null && DateTime.parse(t['due_date']).isBefore(DateTime.now())).length;
      });
    } catch (e) {
      print('Error fetching tasks: $e');
    }
  }

  void _switchRole(String newRole) {
    if (!['leader', 'member'].contains(newRole)) return;

    setState(() {
      selectedRole = newRole;
      // Reset selected group when switching roles
      selectedGroupId = null;
    });
    
    // Load groups for the selected role
    _loadGroupsForRole(newRole).then((_) {
      // If groups available, select first one and fetch its data
      if (groups.isNotEmpty) {
        selectedGroupId = groups[0]['id'];
        _switchGroup(selectedGroupId);
      }
    });
  }

  Future<void> _loadGroupsForRole(String role) async {
    try {
      final user = supabase.auth.currentUser;
      if (user == null) return;

      List<Map<String, dynamic>> fetchedGroups = [];

      if (role == 'leader') {
        // Get groups where user is the leader
        final leaderGroups = await supabase
            .from('groups')
            .select('id')
            .eq('leader_id', user.id);

        for (var group in leaderGroups) {
          try {
            final groupData = await supabase
                .from('groups')
                .select('id, name, project_name')
                .eq('id', group['id'])
                .maybeSingle();

            if (groupData != null) {
              fetchedGroups.add({
                'id': groupData['id'],
                'name': groupData['name'] ?? 'Unnamed',
                'project_name': groupData['project_name'] ?? '',
              });
            }
          } catch (e) {
            print('Error fetching leader group: $e');
          }
        }
      } else {
        // Get groups where user is a member (existing logic)
        List<dynamic> groupMemberships = [];
        try {
          groupMemberships = await supabase
              .from('group_members')
              .select('group_id')
              .eq('user_id', user.id);
        } catch (e) {
          print('Error fetching group_members: $e');
        }

        for (var membership in groupMemberships) {
          final groupId = membership['group_id'];
          try {
            final groupData = await supabase
                .from('groups')
                .select('id, name, project_name')
                .eq('id', groupId)
                .maybeSingle();

            if (groupData != null) {
              fetchedGroups.add({
                'id': groupData['id'],
                'name': groupData['name'] ?? 'Unnamed',
                'project_name': groupData['project_name'] ?? '',
              });
            }
          } catch (e) {
            print('Error fetching group: $e');
          }
        }
      }

      if (mounted) {
        setState(() {
          groups = List<Map<String, dynamic>>.from(fetchedGroups);
        });
      }
    } catch (e) {
      print('Error loading groups for role: $e');
    }
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
                initialValue: selectedMemberId,
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
        currentUserRole: groupRole,
      ),
    ).then((_) {
      // Refresh tasks when dialog closes (in case status was updated)
      _fetchTasks();
    });
  }

  void _switchGroup(String? groupId) {
    if (groupId == null) return;

    setState(() {
      selectedGroupId = groupId;
      loading = true;
    });

    _fetchGroupRoleAndMembers().then((_) {
      _fetchTasks().then((_) {
        if (mounted) {
          setState(() {
            loading = false;
          });
        }
      });
    });
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
      backgroundColor: const Color(0xFF1A1F2E),
      appBar: AppBar(
        title: const Text(
          'Group Dashboard',
          style: TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 28,
            letterSpacing: 0.5,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFF0F1419),
        centerTitle: false,
        elevation: 8,
        shadowColor: Colors.black.withOpacity(0.3),
        toolbarHeight: 80,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Center(
              child: GestureDetector(
                onTap: () {
                  // Profile section (for future expansion)
                },
                child: _buildAppBarProfile(),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(
              child: IconButton(
                icon: const Icon(Icons.logout, size: 28),
                onPressed: _logout,
                tooltip: "Logout",
              ),
            ),
          ),
        ],
      ),
      body: loading
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircularProgressIndicator(
                    strokeWidth: 3,
                    valueColor: AlwaysStoppedAnimation(Color(0xFF00D4FF)),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Loading your workspace...',
                    style: TextStyle(color: Colors.grey[400], fontSize: 14, letterSpacing: 0.2),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadUserData,
              color: const Color(0xFF00D4FF),
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 24, 16, 24),
                children: [
                  // Role Switcher
                  if (userRole == 'leader' || userRole == 'member') ...[
                    _buildRoleSwitcher(),
                    const SizedBox(height: 24),
                  ],
                  // Groups Title
                  Padding(
                    padding: const EdgeInsets.only(left: 16),
                    child: Text(
                      'Your Groups',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Show group selector or empty state
                  if (groups.isEmpty)
                    Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: Colors.blue.withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(Icons.group_add, size: 64, color: Colors.blue[700]),
                          ),
                          const SizedBox(height: 24),
                          const Text(
                            'No Groups Yet',
                            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'You haven\'t joined any groups yet.\nContact your administrator to get started.',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.grey[600], fontSize: 15),
                          ),
                        ],
                      ),
                    )
                  else
                    Column(
                      children: [
                        _buildGroupSelector(),
                        const SizedBox(height: 24),
                        // Group Members Section
                        if (groupMembers.isNotEmpty) ...[
                          _buildMembersSection(),
                          const SizedBox(height: 24),
                        ],
                        // Task Stats
                        _buildStatsSection(),
                      ],
                    ),
                ],
              ),
            ),
    );
  }

  Widget _buildAppBarProfile() {
    final user = supabase.auth.currentUser;
    final userName = user?.userMetadata?['full_name'] ?? user?.email?.split('@')[0] ?? 'User';
    
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF00D4FF), Color(0xFFD946EF)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              userName[0].toUpperCase(),
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Profile',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Colors.grey[400],
                letterSpacing: 0.2,
              ),
            ),
            Text(
              userName,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: Colors.white,
                letterSpacing: 0.2,
              ),
            ),
          ],
        ),
      ],
    );
  }

  // Unused method _buildProfileSection() removed

  Widget _buildGroupSelector() {
    final screenWidth = MediaQuery.of(context).size.width;
    final horizontalPadding = screenWidth * 0.05; // 5% padding on each side
    
    return Container(
      margin: EdgeInsets.symmetric(horizontal: horizontalPadding),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [const Color(0xFF262F3D), const Color(0xFF1F2734)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
        border: Border.all(color: const Color(0xFF00D4FF).withOpacity(0.2), width: 1),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.folder_open, size: 22, color: Color(0xFF00D4FF)),
              const SizedBox(width: 12),
              const Text(
                'Select Group',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                  letterSpacing: 0.3,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFF1A1F2E),
              border: Border.all(color: const Color(0xFF00D4FF).withOpacity(0.3), width: 1.5),
              borderRadius: BorderRadius.circular(12),
            ),
            child: DropdownButton<String>(
              isExpanded: true,
              value: selectedGroupId,
              underline: Container(),
              dropdownColor: const Color(0xFF262F3D),
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
              borderRadius: BorderRadius.circular(12),
              items: groups
                  .map<DropdownMenuItem<String>>((group) =>
                      DropdownMenuItem<String>(
                        value: group['id'] as String,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 12.0),
                          child: Row(
                            children: [
                              const Icon(Icons.group, size: 18, color: Color(0xFF00D4FF)),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      group['name'] ?? 'Unnamed',
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                        color: Colors.white,
                                      ),
                                    ),
                                    Text(
                                      group['project_name'] ?? '',
                                      style: TextStyle(fontSize: 12, color: Colors.grey[400]),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ))
                  .toList(),
              onChanged: _switchGroup,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleSwitcher() {
    return Container(
      margin: const EdgeInsets.only(left: 32, right: 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [const Color(0xFF262F3D), const Color(0xFF1F2734)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
        border: Border.all(color: const Color(0xFF00D4FF).withOpacity(0.2), width: 1),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.security, size: 22, color: Color(0xFF00D4FF)),
              const SizedBox(width: 12),
              const Text(
                'View As',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                  letterSpacing: 0.3,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          SegmentedButton<String>(
            segments: [
              ButtonSegment(
                value: 'member',
                label: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.person, size: 18, color: selectedRole == 'member' ? Colors.black : Colors.grey[400]),
                    const SizedBox(width: 6),
                    const Text('Member'),
                  ],
                ),
              ),
              ButtonSegment(
                value: 'leader',
                label: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.admin_panel_settings, size: 18, color: selectedRole == 'leader' ? Colors.black : Colors.grey[400]),
                    const SizedBox(width: 6),
                    const Text('Leader'),
                  ],
                ),
              ),
            ],
            selected: {selectedRole ?? 'member'},
            onSelectionChanged: (selected) {
              _switchRole(selected.first);
            },
            style: ButtonStyle(
              backgroundColor: WidgetStateProperty.resolveWith((states) {
                if (states.contains(WidgetState.selected)) {
                  return const Color(0xFF00D4FF);
                }
                return const Color(0xFF1A1F2E);
              }),
              foregroundColor: WidgetStateProperty.resolveWith((states) {
                if (states.contains(WidgetState.selected)) {
                  return const Color(0xFF0F1419);
                }
                return Colors.grey[400];
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMembersSection() {
    return Container(
      margin: const EdgeInsets.only(left: 32, right: 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [const Color(0xFF262F3D), const Color(0xFF1F2734)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
        border: Border.all(color: const Color(0xFF00D4FF).withOpacity(0.2), width: 1),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.people, size: 22, color: Color(0xFF00D4FF)),
              const SizedBox(width: 12),
              Text(
                'Group Members (${groupMembers.length})',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                  letterSpacing: 0.3,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...groupMembers.map((member) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFF1A1F2E),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF00D4FF).withOpacity(0.15), width: 1),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          member['name'] ?? 'Unknown',
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          member['email'] ?? '',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[400],
                            letterSpacing: 0.2,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                    decoration: BoxDecoration(
                      color: member['group_role'] == 'leader'
                          ? const Color(0xFFD946EF).withOpacity(0.2)
                          : const Color(0xFF00D4FF).withOpacity(0.2),
                      border: Border.all(
                        color: member['group_role'] == 'leader'
                            ? const Color(0xFFD946EF).withOpacity(0.5)
                            : const Color(0xFF00D4FF).withOpacity(0.5),
                      ),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      member['group_role']?.toUpperCase() ?? 'MEMBER',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: member['group_role'] == 'leader'
                            ? const Color(0xFFD946EF)
                            : const Color(0xFF00D4FF),
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildStatsSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 0.75,
        children: [
          _buildStatCard('Total', total.toString(), const Color(0xFF00D4FF), Icons.assignment, 'all'),
          _buildStatCard('Completed', completed.toString(), const Color(0xFF10B981), Icons.check_circle, 'completed'),
          _buildStatCard('Pending', pending.toString(), const Color(0xFFF59E0B), Icons.schedule, 'pending'),
          _buildStatCard('Overdue', overdue.toString(), const Color(0xFFEF4444), Icons.error_outline, 'overdue'),
        ],
      ),
    );
  }

  Widget _buildTasksHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              groupRole == 'leader' ? 'Group Tasks' : 'My Tasks',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0x002c3e50),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${tasks.length} task${tasks.length != 1 ? 's' : ''}',
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            ),
          ],
        ),
        if (groupRole == 'leader')
          ElevatedButton.icon(
            onPressed: _showAddTaskDialog,
            icon: const Icon(Icons.add, size: 20),
            label: const Text('Add Task'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0x003498db),
              foregroundColor: Colors.white,
              elevation: 2,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
      ],
    );
  }

  Widget _buildEmptyTasksState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 48),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF00D4FF).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.task_alt, size: 48, color: Color(0xFF00D4FF)),
            ),
            const SizedBox(height: 16),
            Text(
              groupRole == 'leader'
                  ? 'No tasks yet'
                  : 'No tasks assigned',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white),
            ),
            const SizedBox(height: 8),
            Text(
              groupRole == 'leader'
                  ? 'Click "Add Task" to create your first task'
                  : 'Waiting for your leader to assign tasks',
              style: TextStyle(color: Colors.grey[400], fontSize: 14, letterSpacing: 0.2),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTasksList() {
    // Filter tasks based on selected filter
    List<Map<String, dynamic>> filteredTasks = tasks.where((task) {
      switch (taskFilter) {
        case 'completed':
          return task['status'] == 'completed';
        case 'pending':
          final dueDate = task['due_date'] != null ? DateTime.parse(task['due_date']) : null;
          return task['status'] != 'completed' && (dueDate == null || dueDate.isAfter(DateTime.now()));
        case 'overdue':
          final dueDate = task['due_date'] != null ? DateTime.parse(task['due_date']) : null;
          return task['status'] != 'completed' && dueDate != null && dueDate.isBefore(DateTime.now());
        default: // 'all'
          return true;
      }
    }).toList();

    if (filteredTasks.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 32),
          child: Text(
            'No tasks to display',
            style: TextStyle(color: Colors.grey[400], fontSize: 14),
          ),
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: filteredTasks.length,
      itemBuilder: (context, index) {
        final task = filteredTasks[index];
        final dueDate = task['due_date'] != null
            ? DateTime.parse(task['due_date'])
            : null;
        final daysLeft = dueDate?.difference(DateTime.now()).inDays;
        final isUrgent = daysLeft != null && daysLeft <= 1 && task['document_submitted'] != true;
        final isOverdue = daysLeft != null && daysLeft < 0 && task['document_submitted'] != true;

        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Container(
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF262F3D), Color(0xFF1F2734)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isOverdue
                    ? const Color(0xFFEF4444).withOpacity(0.5)
                    : isUrgent
                    ? const Color(0xFFF59E0B).withOpacity(0.5)
                    : const Color(0xFF00D4FF).withOpacity(0.2),
                width: 1.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.25),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: ListTile(
              contentPadding: const EdgeInsets.all(14),
              title: Text(
                task['title'] ?? 'Untitled',
                style: TextStyle(
                  fontWeight: isUrgent ? FontWeight.w700 : FontWeight.w600,
                  fontSize: 15,
                  color: isUrgent ? const Color(0xFFF59E0B) : Colors.white,
                ),
              ),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: _getStatusColor(task['document_submitted'] == true 
                              ? (task['status'] == 'completed' ? 'completed' : 'submitted')
                              : 'pending').withOpacity(0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            task['document_submitted'] == true
                              ? (task['status'] == 'completed' ? 'COMPLETED' : 'SUBMITTED')
                              : 'PENDING',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: _getStatusColor(task['document_submitted'] == true 
                                ? (task['status'] == 'completed' ? 'completed' : 'submitted')
                                : 'pending'),
                              letterSpacing: 0.3,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    if (dueDate != null && task['document_submitted'] != true)
                      Row(
                        children: [
                          Icon(Icons.calendar_today, size: 14, color: Colors.grey[600]),
                          const SizedBox(width: 6),
                          Text(
                            'Due: ${dueDate.toLocal().toString().split(' ')[0]}',
                            style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                          ),
                          const SizedBox(width: 12),
                          if (daysLeft != null)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: isOverdue
                                    ? Colors.red.withOpacity(0.15)
                                    : isUrgent
                                    ? Colors.orange.withOpacity(0.15)
                                    : Colors.blue.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                isOverdue
                                    ? '${daysLeft.abs()} day${daysLeft.abs() != 1 ? 's' : ''} overdue'
                                    : daysLeft == 0
                                    ? 'Due today'
                                    : '$daysLeft day${daysLeft != 1 ? 's' : ''} left',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: isOverdue
                                      ? Colors.red[700]
                                      : isUrgent
                                      ? Colors.orange[700]
                                      : Colors.blue[700],
                                ),
                              ),
                            ),
                        ],
                      ),
                  ],
                ),
              ),
              trailing: groupRole == 'leader'
                  ? PopupMenuButton<String>(
                      onSelected: (value) {
                        if (value == 'edit') {
                          _showEditTaskDialog(task);
                        } else if (value == 'delete') {
                          _deleteTask(task['id']);
                        }
                      },
                      itemBuilder: (BuildContext context) => [
                        const PopupMenuItem(value: 'edit', child: Text('Edit')),
                        const PopupMenuItem(value: 'delete', child: Text('Delete', style: TextStyle(color: Colors.red))),
                      ],
                    )
                  : GestureDetector(
                      onTap: () => _showTaskDetail(task),
                      child: Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey[400]),
                    ),
              onTap: () => _showTaskDetail(task),
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatCard(String label, String value, Color color, IconData icon, String filterType) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => FilteredTasksScreen(
              groupId: selectedGroupId!,
              filterType: filterType,
              groupRole: groupRole,
            ),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF262F3D), Color(0xFF1F2734)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: color.withOpacity(0.3),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.25),
              blurRadius: 16,
              offset: const Offset(0, 6),
            )
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.2),
                shape: BoxShape.circle,
                border: Border.all(color: color.withOpacity(0.4), width: 1),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 12),
            Text(
              value,
              style: TextStyle(
                color: color,
                fontSize: 26,
                fontWeight: FontWeight.bold,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 6),
            Flexible(
              child: Text(
                label,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.grey[400],
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'completed':
        return const Color(0xFF10B981);
      case 'submitted':
        return const Color(0xFF00D4FF);
      case 'in_progress':
        return const Color(0xFFF59E0B);
      case 'pending':
        return const Color(0xFFEF4444);
      default:
        return Colors.grey[600]!;
    }
  }
}


