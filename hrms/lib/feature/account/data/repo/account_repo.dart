import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/feature/account/data/datasources/account_remote.dart';
import 'package:hrms/feature/employee/domain/entities/employee.dart';
import 'package:hrms/feature/position/domain/entities/position.dart';
import 'package:hrms/feature/recruitment/domain/entities/candidate.dart';

import '../../../employee/data/mapper/employee_mapper.dart';
import '../../../recruitment/data/mapper/candidate_mapper.dart';

class AccountRepo {
  final AccountRemote remote;

  AccountRepo(this.remote);

  Future<Employee> fetchEmployeeProfile() async {
    final result = await remote.fetchEmployeeProfile();
    return result.toEntity();
  }

  Future<Candidate> fetchCandidateProfile() async {
    final result = await remote.fetchCandidateProfile();
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
