import 'package:flutter/material.dart';

class BlockReasonScreen extends StatefulWidget {
  const BlockReasonScreen({super.key});

  @override
  State<BlockReasonScreen> createState() => _BlockReasonScreenState();
}

class _BlockReasonScreenState extends State<BlockReasonScreen> {
  final TextEditingController reason = TextEditingController();

  @override
  void dispose() {
    reason.dispose(); // prevent memory leak
    super.dispose();
  }

  void _submitIssue() {
    if (reason.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Please explain your issue before submitting"),
        ),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text("Issue submitted successfully"),
      ),
    );

    reason.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Report Block Issue"),
        backgroundColor: Colors.blueGrey,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            TextField(
              controller: reason,
              maxLines: 5,
              decoration: const InputDecoration(
                label: Text("Explain your issue"),
                border: OutlineInputBorder(),
              ),
            ),

            const Spacer(),

            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.redAccent,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                ),
                onPressed: _submitIssue,
                child: const Text(
                  "Submit Issue",
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
