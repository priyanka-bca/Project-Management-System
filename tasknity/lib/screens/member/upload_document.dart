import 'dart:io';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:file_picker/file_picker.dart';

class UploadDocumentScreen extends StatelessWidget {
  final String taskId;
  const UploadDocumentScreen({super.key, required this.taskId});

  @override
  Widget build(BuildContext context) {
    final supabase = Supabase.instance.client;

    Future<void> upload() async {
      final result = await FilePicker.platform.pickFiles();
      if (result == null) return;

      final file = File(result.files.single.path!);
      final userId = supabase.auth.currentUser!.id;

      final path = 'documents/$userId-${DateTime.now().millisecondsSinceEpoch}';

      await supabase.storage.from('documents').upload(path, file);
      final url = supabase.storage.from('documents').getPublicUrl(path);

      await supabase.from('tasks').update({
        'document_url': url,
      }).eq('id', taskId);

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
