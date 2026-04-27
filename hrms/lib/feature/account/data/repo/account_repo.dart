import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/feature/account/data/datasources/account_remote.dart';
import 'package:hrms/feature/employee/domain/entities/employee.dart';
import 'package:hrms/feature/position/domain/position.dart';

import '../../../employee/data/mapper/employee_mapper.dart';

class AccountRepo {
  final AccountRemote remote;

  AccountRepo(this.remote);

  Future<Employee> fetchProfile() async {
    final result = await remote.fetchProfile();
    return result.toEntity();
  }

  Future<Set<Permission>> fetchPermissions() async {
    final keys = await remote.fetchPermissions();
    return keys.map((key) => PermissionKeyX.fromString(key)).whereType<Permission>().toSet();
  }
}

final accountRepoProvider = Provider((ref) {
  final remote = ref.watch(accountRemoteProvider);
  return AccountRepo(remote);
});
