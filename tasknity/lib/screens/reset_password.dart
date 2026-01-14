import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:math';

class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final emailController = TextEditingController();
  final otpController = TextEditingController();
  final passwordController = TextEditingController();
  bool _loading = false;
  int _step = 1; // 1: email, 2: otp, 3: password
  String _resetEmail = '';

  String _generateOTP() {
    return Random().nextInt(999999).toString().padLeft(6, '0');
  }

  Future<void> _sendOTP() async {
    final email = emailController.text.trim();
    if (email.isEmpty) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text("Enter your email")));
      return;
    }

    setState(() => _loading = true);

    try {
      // Generate 6-digit OTP
      final otp = _generateOTP();
      final expiresAt = DateTime.now().add(const Duration(minutes: 10));

      // Save OTP to database
      await Supabase.instance.client.from('password_reset_otp').insert({
        'email': email,
        'otp': otp,
        'expires_at': expiresAt.toIso8601String(),
      });

      // OTP stored in database - ready for verification
      // In production, you can add email sending via Supabase functions or another service
      // For now, OTP is displayed in the app for development/testing

      if (mounted) {
        setState(() {
          _step = 2;
          _resetEmail = email;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("OTP sent to $email\n(Dev OTP: $otp)"),
            duration: const Duration(seconds: 5),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text("Error: $e")));
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _verifyOTP() async {
    final otp = otpController.text.trim();
    if (otp.isEmpty) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text("Enter the OTP")));
      return;
    }

    setState(() => _loading = true);

    try {
      // Query database for matching OTP
      final response = await Supabase.instance.client
          .from('password_reset_otp')
          .select()
          .eq('email', _resetEmail)
          .eq('otp', otp)
          .eq('used', false);

      if (response.isEmpty) {
        throw Exception('Invalid or expired OTP');
      }

      final record = response[0];
      final expiresAt = DateTime.parse(record['expires_at']);
      if (DateTime.now().isAfter(expiresAt)) {
        throw Exception('OTP has expired');
      }

      // Mark OTP as used
      await Supabase.instance.client
          .from('password_reset_otp')
          .update({'used': true})
          .eq('id', record['id']);
      
      if (mounted) {
        setState(() => _step = 3);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("OTP verified! Enter your new password")),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text("Error: $e")));
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _resetPassword() async {
    final password = passwordController.text.trim();
    if (password.isEmpty || password.length < 6) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text("Password must be at least 6 characters")));
      return;
    }

    setState(() => _loading = true);

    try {
      // Use HTTP directly with longer timeout
      final response = await http.post(
        Uri.parse('https://zsangtjxipvxbwmdmzoy.supabase.co/functions/v1/send-reset-otp'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'email': _resetEmail,
          'newPassword': password,
        }),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Password reset successfully!")),
          );
          Navigator.pushReplacementNamed(context, '/login');
        }
      } else {
        throw Exception('Failed: ${response.body}');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text("Error: $e")));
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF6A11CB), Color(0xFF2575FC)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 25, vertical: 20),
              child: Container(
                padding: const EdgeInsets.all(25),
                constraints: const BoxConstraints(maxWidth: 400),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      offset: const Offset(0, 6),
                      blurRadius: 25,
                      color: Colors.black12.withOpacity(0.1),
                    )
                  ],
                  borderRadius: BorderRadius.circular(25),
                ),
                child: _step == 1 ? _buildEmailUI() : (_step == 2 ? _buildOtpUI() : _buildPasswordUI()),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmailUI() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.all(15),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.blueGrey[50],
          ),
          child: const Icon(Icons.lock_reset, size: 55, color: Color(0xFF2575FC)),
        ),
        const SizedBox(height: 20),
        const Text(
          "Reset Password",
          style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 22,
              color: Colors.black87),
        ),
        const SizedBox(height: 10),
        const Text(
          "Enter your email to receive an OTP.",
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 15, color: Colors.grey),
        ),
        const SizedBox(height: 25),
        TextField(
          controller: emailController,
          keyboardType: TextInputType.emailAddress,
          decoration: InputDecoration(
            labelText: "Email",
            prefixIcon: const Icon(Icons.email_outlined),
            filled: true,
            fillColor: Colors.grey[100],
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(15),
              borderSide: BorderSide.none,
            ),
          ),
        ),
        const SizedBox(height: 30),
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: _loading ? null : _sendOTP,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2575FC),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15),
              ),
              elevation: 5,
            ),
            child: _loading
                ? const CircularProgressIndicator(color: Colors.white)
                : const Text(
                    "Send OTP",
                    style: TextStyle(
                        fontSize: 16, fontWeight: FontWeight.bold),
                  ),
          ),
        ),
        const SizedBox(height: 15),
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text(
            "Back to Login",
            style: TextStyle(
                color: Color(0xFF2575FC),
                fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }

  Widget _buildOtpUI() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.all(15),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.blue[50],
          ),
          child: const Icon(Icons.mail, size: 55, color: Colors.blue),
        ),
        const SizedBox(height: 20),
        const Text(
          "Verify OTP",
          style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 22,
              color: Colors.black87),
        ),
        const SizedBox(height: 10),
        Text(
          "Enter the 6-digit code sent to $_resetEmail",
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 15, color: Colors.grey),
        ),
        const SizedBox(height: 25),
        TextField(
          controller: otpController,
          maxLength: 6,
          keyboardType: TextInputType.number,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 24, letterSpacing: 8),
          decoration: InputDecoration(
            hintText: "000000",
            filled: true,
            fillColor: Colors.grey[100],
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(15),
              borderSide: BorderSide.none,
            ),
            counterText: '',
          ),
        ),
        const SizedBox(height: 30),
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: _loading ? null : _verifyOTP,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2575FC),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15),
              ),
              elevation: 5,
            ),
            child: _loading
                ? const CircularProgressIndicator(color: Colors.white)
                : const Text(
                    "Verify OTP",
                    style: TextStyle(
                        fontSize: 16, fontWeight: FontWeight.bold),
                  ),
          ),
        ),
        const SizedBox(height: 15),
        TextButton(
          onPressed: _loading ? null : _sendOTP,
          child: const Text(
            "Didn't receive OTP? Resend",
            style: TextStyle(
                color: Color(0xFF2575FC),
                fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }

  Widget _buildPasswordUI() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.all(15),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.green[50],
          ),
          child: const Icon(Icons.verified, size: 55, color: Colors.green),
        ),
        const SizedBox(height: 20),
        const Text(
          "Set New Password",
          style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 22,
              color: Colors.black87),
        ),
        const SizedBox(height: 10),
        const Text(
          "Enter your new password",
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 15, color: Colors.grey),
        ),
        const SizedBox(height: 25),
        TextField(
          controller: passwordController,
          obscureText: true,
          decoration: InputDecoration(
            labelText: "New Password",
            prefixIcon: const Icon(Icons.lock_outline),
            filled: true,
            fillColor: Colors.grey[100],
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(15),
              borderSide: BorderSide.none,
            ),
          ),
        ),
        const SizedBox(height: 30),
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: _loading ? null : _resetPassword,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2575FC),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15),
              ),
              elevation: 5,
            ),
            child: _loading
                ? const CircularProgressIndicator(color: Colors.white)
                : const Text(
                    "Reset Password",
                    style: TextStyle(
                        fontSize: 16, fontWeight: FontWeight.bold),
                  ),
          ),
        ),
      ],
    );
  }
}
