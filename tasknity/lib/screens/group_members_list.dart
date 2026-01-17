import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class GroupMembersList extends StatefulWidget {
  final String groupId;
  final String groupName;

  const GroupMembersList({
    super.key,
    required this.groupId,
    required this.groupName,
  });

  @override
  State<GroupMembersList> createState() => _GroupMembersListState();
}

class _GroupMembersListState extends State<GroupMembersList> {
  final supabase = Supabase.instance.client;
  List<Map<String, dynamic>> members = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _fetchMembers();
  }

  Future<void> _fetchMembers() async {
    try {
      // Fetch all members in this group
      final membersData = await supabase
          .from('group_members')
          .select('user_id, role')
          .eq('group_id', widget.groupId);

      List<Map<String, dynamic>> membersList = [];
      for (var member in membersData) {
        final profileData = await supabase
            .from('profiles')
            .select('email, name, full_name, role')
            .eq('id', member['user_id'])
            .maybeSingle();

        if (profileData != null) {
          membersList.add({
            'user_id': member['user_id'],
            'email': profileData['email'],
            'name': profileData['name'] ?? profileData['full_name'] ?? 'Unknown',
            'group_role': member['role'],
          });
        }
      }

      if (mounted) {
        setState(() {
          members = membersList;
          loading = false;
        });
      }
    } catch (e) {
      print('Error fetching members: $e');
      if (mounted) {
        setState(() {
          loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A1F2E),
      appBar: AppBar(
        title: Text(
          widget.groupName,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 22,
            letterSpacing: 0.5,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFF0F1419),
        centerTitle: false,
        elevation: 8,
        shadowColor: Colors.black.withOpacity(0.3),
        toolbarHeight: 70,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, size: 28, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: loading
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircularProgressIndicator(
                    strokeWidth: 3,
                    valueColor: AlwaysStoppedAnimation(Color(0xFF00D4FF)),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Loading members...',
                    style: TextStyle(color: Colors.grey[400], fontSize: 14),
                  ),
                ],
              ),
            )
          : members.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.blue.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(Icons.people, size: 64, color: Colors.blue[700]),
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        'No Members',
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'No members found in this group.',
                        style: TextStyle(color: Colors.grey[600], fontSize: 15),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: members.length,
                  itemBuilder: (context, index) {
                    final member = members[index];
                    final role = member['group_role'];
                    final isLeader = role == 'leader';

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF262F3D),
                        border: Border.all(
                          color: isLeader ? const Color(0xFFD946EF) : const Color(0xFF00D4FF),
                          width: 1.5,
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 50,
                            height: 50,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: isLeader
                                    ? [const Color(0xFFD946EF), const Color(0xFF00D4FF)]
                                    : [const Color(0xFF00D4FF), const Color(0xFF0EA5E9)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                member['name'][0].toUpperCase(),
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  member['name'],
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                                Text(
                                  member['email'],
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[400],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: isLeader ? const Color(0xFFD946EF) : const Color(0xFF00D4FF),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              isLeader ? 'LEADER' : 'MEMBER',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: Colors.black,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
