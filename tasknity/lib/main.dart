import 'package:flutter/material.dart';
import 'screens/dashboard_screen.dart';
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/member/update_progress.dart';
import 'screens/member/block_reason.dart';
import 'screens/leader/task_detail.dart';
import 'screens/leader/create_task.dart';
import 'screens/leader/leader_dashboard.dart';
import 'screens/member/member_dashboard.dart';

void main() {
  runApp(const TasknityApp());
}

class TasknityApp extends StatelessWidget {
  const TasknityApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tasknity',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.indigo, useMaterial3: true),
      initialRoute: '/create_task',
      routes: {
        '/login': (context) => const LoginScreen(),
        '/signup': (context) => const SignupScreen(),
        '/dashboard': (context) => const DashboardScreen(),
        '/update_progress': (context) => const UpdateProgressScreen(),
        '/block_reason': (context) => const BlockReasonScreen(),
        '/task_details': (context) => const TaskDetailsScreen(),
        '/create_task': (context) => const CreateTaskScreen(),
        '/leader_dashboard': (context) => const LeaderDashboard(),
        '/member_dashboard': (context) => const MemberDashboard(),
      },
    );
  }
}