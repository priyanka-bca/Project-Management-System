import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// Screens
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/reset_password.dart';
import 'screens/verify_email_screen.dart';
import 'screens/group_dashboard.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase
  await Supabase.initialize(
    url: 'https://zsangtjxipvxbwmdmzoy.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzYW5ndGp4aXB2eGJ3bWRtem95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODk4NjEsImV4cCI6MjA4MDI2NTg2MX0.Au7p0GmMwbraGu9LjhIejff76boX-WLs7j-VtwUk0Mw',
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
        '/verify-email': (context) {
          final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
          return VerifyEmailScreen(
            email: args?['email'] ?? '',
            fullName: args?['fullName'] ?? '',
            userId: args?['userId'] ?? '',
          );
        },
        '/reset-password': (context) => const ResetPasswordScreen(),
        '/group-dashboard': (context) => const GroupDashboard(),
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

    if (_role == 'leader' || _role == 'member') {
      return const GroupDashboard();
    } else {
      return const LoginScreen();
    }
  }
}
