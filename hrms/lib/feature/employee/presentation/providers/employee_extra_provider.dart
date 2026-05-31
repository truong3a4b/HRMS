import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/repo/employee_extra_repository.dart';
import '../../domain/entities/employee_extra.dart';

class EmployeeExtraQuery {
  final String employeeId;
  final bool isMine;

  const EmployeeExtraQuery({required this.employeeId, required this.isMine});

  @override
  bool operator ==(Object other) {
    return other is EmployeeExtraQuery &&
        other.employeeId == employeeId &&
        other.isMine == isMine;
  }

  @override
  int get hashCode => Object.hash(employeeId, isMine);
}

final employeePayrollProfileProvider = FutureProvider.autoDispose
    .family<EmployeePayrollProfileInfo?, EmployeeExtraQuery>((ref, query) {
      return ref
          .read(employeeExtraRepositoryProvider)
          .getPayrollProfile(
            employeeId: query.employeeId,
            isMine: query.isMine,
          );
    });

final employeeJobHistoryProvider = FutureProvider.autoDispose
    .family<List<EmployeeJobHistory>, EmployeeExtraQuery>((ref, query) {
      return ref
          .read(employeeExtraRepositoryProvider)
          .getJobHistory(employeeId: query.employeeId, isMine: query.isMine);
    });
