import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'create_task.dart';
import 'task_detail.dart';

class LeaderDashboard extends StatefulWidget {
  const LeaderDashboard({super.key});

  @override
  State<LeaderDashboard> createState() => _LeaderDashboardState();
}

class _LeaderDashboardState extends State<LeaderDashboard> {
  final supabase = Supabase.instance.client;
  bool authorized = true;

  @override
  void initState() {
    super.initState();
    _checkLeaderAccess();
  }

  Future<void> _checkLeaderAccess() async {
    try {
      final user = supabase.auth.currentUser;
      if (user == null) {
        setState(() => authorized = false);
        Navigator.pushReplacementNamed(context, '/login');
        return;
      }

      // Try to fetch role, but if it fails, assume member role
      String role = 'member';
      try {
        final profiles = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id);
        
        if (profiles.isNotEmpty) {
          role = profiles[0]['role'] as String? ?? 'member';
        }
      } catch (e) {
        print('Role fetch failed: $e, using default member role');
      }

      if (role != 'leader') {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Access denied: Leader only')),
          );
          Navigator.pushReplacementNamed(context, '/login');
        }
        setState(() => authorized = false);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
        Navigator.pushReplacementNamed(context, '/login');
      }
      setState(() => authorized = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!authorized) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text("Leader Dashboard"),
        backgroundColor: Colors.blueGrey,
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              final prefs = await SharedPreferences.getInstance();
              await supabase.auth.signOut();
              await prefs.remove('token');
              await prefs.remove('role');
              if (mounted && context.mounted) {
                Navigator.pushReplacementNamed(context, '/login');
              }
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: Colors.blueGrey,
        child: const Icon(Icons.add),
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const CreateTaskScreen()),
          );
        },
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            const Text(
              "Your Tasks",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),

            // Placeholder list
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: 5, // replace later
              itemBuilder: (context, index) {
                return Card(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                  elevation: 2,
                  child: ListTile(
                    title: Text("Task ${index + 1}"),
                    subtitle: const Text("Deadline: 2025-01-12"),
                    trailing: const Icon(Icons.arrow_forward_ios),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => TaskDetailsScreen()),
                      );
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
}
