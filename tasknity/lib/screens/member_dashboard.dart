import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'update_progress.dart';
import 'upload_document.dart';

class MemberDashboard extends StatefulWidget {
  const MemberDashboard({super.key});

  @override
  State<MemberDashboard> createState() => _MemberDashboardState();
}

class _MemberDashboardState extends State<MemberDashboard> {
  final supabase = Supabase.instance.client;
  List tasks = [];

  @override
  void initState() {
    super.initState();
    fetchTasks();
  }

  Future<void> fetchTasks() async {
    final userId = supabase.auth.currentUser!.id;

    final data = await supabase
        .from('tasks')
        .select()
        .eq('assigned_to', userId);

    setState(() => tasks = data);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("My Tasks"),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await supabase.auth.signOut();
              if (mounted) setState(() {});
            },
          )
        ],
      ),
      body: ListView.builder(
        itemCount: tasks.length,
        itemBuilder: (_, i) {
          final t = tasks[i];
          return Card(
            child: ListTile(
              title: Text(t['title']),
              subtitle: Text("Progress: ${t['progress']}%"),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: const Icon(Icons.upload),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => UploadDocumentScreen(taskId: t['id']),
                        ),
                      );
                    },
                  ),
                  IconButton(
                    icon: const Icon(Icons.edit),
                    onPressed: () async {
                      await Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => UpdateProgressScreen(taskId: t['id']),
                        ),
                      );
                      fetchTasks();
                    },
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
