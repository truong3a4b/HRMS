import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/feature/employee/domain/entities/employee.dart';

import '../../data/repo/account_repo.dart';

final profileProvider = FutureProvider<Employee>((ref) async {
  final repo = ref.read(accountRepoProvider);
  return repo.fetchProfile();
});
