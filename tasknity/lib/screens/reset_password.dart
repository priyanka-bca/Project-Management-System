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
      backgroundColor: const Color(0xFF0F1419),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              constraints: const BoxConstraints(maxWidth: 420),
              color: const Color(0xFF0F1419),
              child: _step == 1 
                ? _buildEmailUI() 
                : (_step == 2 
                  ? _buildOtpUI() 
                  : _buildPasswordUI()),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmailUI() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Reset Password",
          style: TextStyle(
            fontWeight: FontWeight.w900,
            fontSize: 32,
            color: Colors.white,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          "Enter your email address to receive a password reset OTP",
          style: TextStyle(
            fontSize: 15,
            color: Colors.grey.shade400,
            height: 1.5,
          ),
        ),
        const SizedBox(height: 28),
        Text(
          'Email Address',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: Colors.grey.shade300,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 10),
        TextField(
          controller: emailController,
          keyboardType: TextInputType.emailAddress,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 15,
          ),
          decoration: InputDecoration(
            hintText: "you@example.com",
            hintStyle: TextStyle(
              color: Colors.grey.shade600,
            ),
            prefixIcon: Icon(
              Icons.email_outlined,
              color: Colors.grey.shade500,
              size: 20,
            ),
            filled: true,
            fillColor: Colors.white.withOpacity(0.05),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16, vertical: 14),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(
                color: Colors.white.withOpacity(0.1),
                width: 1.5,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(
                color: Colors.white.withOpacity(0.1),
                width: 1.5,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(
                color: Color(0xFF667EEA),
                width: 2,
              ),
            ),
          ),
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: _loading ? null : _sendOTP,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF667EEA),
            foregroundColor: Colors.white,
            minimumSize: const Size.fromHeight(56),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            elevation: 4,
            shadowColor:
                const Color(0xFF667EEA).withOpacity(0.4),
          ),
          child: _loading
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(
                      Colors.white,
                    ),
                    strokeWidth: 2.5,
                  ),
                )
              : const Text(
                  "Send OTP",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
        ),
        const SizedBox(height: 18),
        Center(
          child: TextButton(
            onPressed: () => Navigator.pop(context),
            style: TextButton.styleFrom(
              padding: EdgeInsets.zero,
            ),
            child: const Text(
              "← Back to Login",
              style: TextStyle(
                color: Color(0xFF667EEA),
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildOtpUI() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Verify OTP",
          style: TextStyle(
            fontWeight: FontWeight.w900,
            fontSize: 32,
            color: Colors.white,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          "Enter the 6-digit code sent to $_resetEmail",
          style: TextStyle(
            fontSize: 15,
            color: Colors.grey.shade400,
            height: 1.5,
          ),
        ),
        const SizedBox(height: 28),
        Text(
          'OTP Code',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: Colors.grey.shade300,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 10),
        TextField(
          controller: otpController,
          maxLength: 6,
          keyboardType: TextInputType.number,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.bold,
            letterSpacing: 8,
          ),
          decoration: InputDecoration(
            hintText: "000000",
            hintStyle: TextStyle(
              color: Colors.grey.shade600,
            ),
            filled: true,
            fillColor: Colors.white.withOpacity(0.05),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16, vertical: 18),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(
                color: Colors.white.withOpacity(0.1),
                width: 1.5,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(
                color: Colors.white.withOpacity(0.1),
                width: 1.5,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(
                color: Color(0xFF667EEA),
                width: 2,
              ),
            ),
            counterText: '',
          ),
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: _loading ? null : _verifyOTP,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF667EEA),
            foregroundColor: Colors.white,
            minimumSize: const Size.fromHeight(56),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            elevation: 4,
            shadowColor:
                const Color(0xFF667EEA).withOpacity(0.4),
          ),
          child: _loading
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(
                      Colors.white,
                    ),
                    strokeWidth: 2.5,
                  ),
                )
              : const Text(
                  "Verify OTP",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
        ),
        const SizedBox(height: 18),
        TextButton(
          onPressed: _loading ? null : _sendOTP,
          style: TextButton.styleFrom(
            padding: EdgeInsets.zero,
          ),
          child: const Text(
            "Didn't receive OTP? Resend",
            style: TextStyle(
              color: Color(0xFF667EEA),
              fontWeight: FontWeight.w600,
              fontSize: 14,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPasswordUI() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Set New Password",
          style: TextStyle(
            fontWeight: FontWeight.w900,
            fontSize: 32,
            color: Colors.white,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          "Create a strong password for your account",
          style: TextStyle(
            fontSize: 15,
            color: Colors.grey.shade400,
            height: 1.5,
          ),
        ),
        const SizedBox(height: 28),
        Text(
          'New Password',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: Colors.grey.shade300,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 10),
        TextField(
          controller: passwordController,
          obscureText: true,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 15,
          ),
          decoration: InputDecoration(
            hintText: "Enter new password",
            hintStyle: TextStyle(
              color: Colors.grey.shade600,
            ),
            prefixIcon: Icon(
              Icons.lock_outline,
              color: Colors.grey.shade500,
              size: 20,
            ),
            filled: true,
            fillColor: Colors.white.withOpacity(0.05),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16, vertical: 14),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(
                color: Colors.white.withOpacity(0.1),
                width: 1.5,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(
                color: Colors.white.withOpacity(0.1),
                width: 1.5,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(
                color: Color(0xFF667EEA),
                width: 2,
              ),
            ),
          ),
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: _loading ? null : _resetPassword,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF667EEA),
            foregroundColor: Colors.white,
            minimumSize: const Size.fromHeight(56),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            elevation: 4,
            shadowColor:
                const Color(0xFF667EEA).withOpacity(0.4),
          ),
          child: _loading
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(
                      Colors.white,
                    ),
                    strokeWidth: 2.5,
                  ),
                )
              : const Text(
                  "Reset Password",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
        ),
      ],
    );
  }
}
