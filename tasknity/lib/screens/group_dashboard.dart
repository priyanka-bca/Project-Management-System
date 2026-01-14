import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

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
  List<Map<String, dynamic>> groups = [];
  List<Map<String, dynamic>> tasks = [];
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

      // Fetch user's groups - try different approaches
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

      print('Final fetched groups: $fetchedGroups');

      if (!mounted) return;

      setState(() {
        userRole = role;
        selectedRole = role;
        groups = fetchedGroups;
        if (groups.isNotEmpty) {
          selectedGroupId = groups[0]['id'];
        }
        loading = false;
      });

      if (selectedGroupId != null) {
        await _fetchTasks();
      }
    } catch (e) {
      print('Error loading data: $e');
      if (mounted) {
        setState(() => loading = false);
      }
    }
  }

  Future<void> _fetchTasks() async {
    try {
      final user = supabase.auth.currentUser;
      if (user == null || selectedGroupId == null) return;

      List<Map<String, dynamic>> fetchedTasks = [];

      if (selectedRole == 'leader') {
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
      loading = true;
    });

    _fetchTasks().then((_) {
      if (mounted) {
        setState(() => loading = false);
      }
    });
  }

  void _switchGroup(String? groupId) {
    if (groupId == null) return;

    setState(() {
      selectedGroupId = groupId;
      loading = true;
    });

    _fetchTasks().then((_) {
      if (mounted) {
        setState(() => loading = false);
      }
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
                      // Tasks List
                      Text(
                        selectedRole == 'leader' ? 'Group Tasks' : 'My Tasks',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 10),
                      tasks.isEmpty
                          ? Center(
                              child: Padding(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 32),
                                child: Text(
                                  selectedRole == 'leader'
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
                                return Card(
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  elevation: 1,
                                  child: ListTile(
                                    title: Text(task['title'] ?? 'Untitled'),
                                    subtitle: Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            'Status: ${task['status'] ?? 'pending'}',
                                          ),
                                        ),
                                        if (selectedRole == 'leader' &&
                                            task['assigned_to'] != null)
                                          Text(
                                            'Progress: ${task['progress'] ?? 0}%',
                                            style: const TextStyle(
                                                fontSize: 12),
                                          ),
                                      ],
                                    ),
                                    trailing:
                                        const Icon(Icons.arrow_forward_ios),
                                    onTap: () {
                                      // Navigate to task detail
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
