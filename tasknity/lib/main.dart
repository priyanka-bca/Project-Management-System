import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// Screens
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/reset_password.dart';
import 'screens/dashboard_screen.dart';
import 'screens/leader/leader_dashboard.dart';
import 'screens/member/member_dashboard.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 🔴 REQUIRED: Supabase initialization
  await Supabase.initialize(
    url: 'https://YOUR_PROJECT_ID.supabase.co',
    anonKey: 'YOUR_PUBLIC_ANON_KEY',
  );

  runApp(const TasknityApp());
}

class TasknityApp extends StatelessWidget {
  const TasknityApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tasknity',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: Colors.blueGrey,
      ),
      home: const AuthWrapper(),
      routes: {
        '/login': (context) => const LoginScreen(),
        '/signup': (context) => const SignupScreen(),
        '/reset-password': (context) => const ResetPasswordScreen(),
        '/dashboard': (context) => const DashboardScreen(),
        '/leader-dashboard': (context) => const LeaderDashboard(),
        '/member-dashboard': (context) => const MemberDashboard(),
      },
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  bool _loading = true;
  String? _role;

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    final role = prefs.getString('role'); // leader / member

    setState(() {
      _role = token != null ? role : null;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_role == 'leader') {
      return const LeaderDashboard();
    } else if (_role == 'member') {
      return const MemberDashboard();
    } else {
      return const LoginScreen();
    }
  }
}
