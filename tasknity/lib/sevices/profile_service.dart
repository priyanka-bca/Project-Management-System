import 'package:supabase_flutter/supabase_flutter.dart';

class ProfileService {
  final _client = Supabase.instance.client;

  Future<Map<String, dynamic>> getMyProfile() async {
    final uid = _client.auth.currentUser!.id;

    final res = await _client
        .from('profiles')
        .select()
        .eq('id', uid)
        .single();

    return res;
  }
}
