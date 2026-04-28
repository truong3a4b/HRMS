import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../position/domain/entities/position.dart';
import '../../data/repo/account_repo.dart';

final permissionProvider = FutureProvider<Set<Permission>>((ref) async {
  final repo = ref.read(accountRepoProvider);
  return repo.fetchPermissions();
});