import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class VerifyEmailScreen extends StatefulWidget {
  final String email;
  final String fullName;
  final String userId;

  const VerifyEmailScreen({
    super.key,
    required this.email,
    required this.fullName,
    required this.userId,
  });

  @override
  State<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends State<VerifyEmailScreen> {
  final supabase = Supabase.instance.client;
  final TextEditingController _otpController = TextEditingController();
  bool _isLoading = false;
  bool _resendLoading = false;

  Future<void> _verifyOTP() async {
    final otp = _otpController.text.trim();

    if (otp.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter the OTP code')),
      );
      return;
    }

    if (otp.length != 6) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('OTP must be 6 digits')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      // Query the email_otps table to verify OTP
      final response = await supabase
          .from('email_otps')
          .select()
          .eq('user_id', widget.userId)
          .eq('otp', otp)
          .single();

      if (response != null) {
        // OTP is valid, create the profile
        await supabase.from('profiles').insert({
          'id': widget.userId,
          'full_name': widget.fullName,
          'email': widget.email,
          'role': 'member',
        });

        // Delete the used OTP
        await supabase
            .from('email_otps')
            .delete()
            .eq('user_id', widget.userId);

        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Email verified successfully!')),
        );
        Navigator.pushReplacementNamed(context, '/login');
      }
    } on PostgrestException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Invalid OTP: ${e.message}')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _resendEmail() async {
    setState(() => _resendLoading = true);

    try {
      // Generate new OTP
      final otp = (100000 + (DateTime.now().millisecondsSinceEpoch % 900000)).toString();
      
      // Delete old OTP
      await supabase
          .from('email_otps')
          .delete()
          .eq('user_id', widget.userId);
      
      // Insert new OTP
      await supabase.from('email_otps').insert({
        'user_id': widget.userId,
        'email': widget.email,
        'otp': otp,
        'created_at': DateTime.now().toIso8601String(),
      });
      
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('New OTP: $otp'),
          duration: const Duration(seconds: 5),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      if (mounted) {
        setState(() => _resendLoading = false);
      }
    }
  }

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verify Email')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.mail_outline, size: 80, color: Colors.blue),
              const SizedBox(height: 24),
              const Text(
                'Verify Your Email',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              Text(
                'Enter the 6-digit OTP displayed on signup\n${widget.email}',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16, color: Colors.grey),
              ),
              const SizedBox(height: 32),
              TextField(
                controller: _otpController,
                maxLength: 6,
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 24, letterSpacing: 8),
                decoration: InputDecoration(
                  hintText: '000000',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  counterText: '',
                ),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _verifyOTP,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Verify OTP', style: TextStyle(fontSize: 16)),
                ),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: _resendLoading ? null : _resendEmail,
                child: _resendLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Didn\'t receive the code? Resend'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
