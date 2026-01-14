import 'dart:io';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
// import 'package:file_picker/file_picker.dart'; // Android/iOS only - disabled for desktop testing

class UploadDocumentScreen extends StatelessWidget {
  final String taskId;
  const UploadDocumentScreen({super.key, required this.taskId});

  @override
  Widget build(BuildContext context) {
    final supabase = Supabase.instance.client;

    Future<void> upload() async {
      // TODO: Implement file picker for Android/iOS
      // For now, show placeholder
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('File upload available on mobile app')),
      );
      Navigator.pop(context);
    }

    return Scaffold(
      appBar: AppBar(title: const Text("Upload Document")),
      body: Center(
        child: ElevatedButton(
          onPressed: upload,
          child: const Text("Select & Upload File"),
        ),
      ),
    );
  }
}
