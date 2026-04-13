import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/feature/account/presentation/providers/profile_state.dart';

import '../../../../core/network/dio_client.dart';
import '../../data/datasources/profile_remote.dart';
import '../../data/repo/profile_repository.dart';

final profileRemoteProvider = Provider<ProfileRemote>((ref) {
  final dio = ref.watch(dioProvider);
  return ProfileRemote(dio: dio);
});

final profileRepositoryProvider = Provider((ref) {
  final remote = ref.watch(profileRemoteProvider);
  return ProfileRepository(remote);
});

final profileProvider = AsyncNotifierProvider<ProfileNotifier, ProfileState>(() {
  return ProfileNotifier();
});

class ProfileNotifier extends AsyncNotifier<ProfileState> {
  late final ProfileRepository _repo;

  @override
  Future<ProfileState> build() async {
    _repo = ref.watch(profileRepositoryProvider);
    return  ProfileState.initial();
  }

  Future<void> fetchProfile() async {
    state = const AsyncValue.loading();
    try {
      final user = await _repo.fetchProfile();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }
}