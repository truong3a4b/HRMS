import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/employee_extra.dart';
import '../datasources/employee_extra_remote.dart';

class EmployeeExtraRepository {
  final EmployeeExtraRemote remote;

  EmployeeExtraRepository(this.remote);

  Future<EmployeePayrollProfileInfo?> getPayrollProfile({
    required String employeeId,
    required bool isMine,
  }) async {
    final json = await remote.getPayrollProfile(
      employeeId: employeeId,
      isMine: isMine,
    );
    if (json == null) return null;
    return _payrollProfileFromJson(json);
  }

  Future<List<EmployeeJobHistory>> getJobHistory({
    required String employeeId,
    required bool isMine,
  }) async {
    final items = await remote.getJobHistory(
      employeeId: employeeId,
      isMine: isMine,
    );
    return items.map(_jobHistoryFromJson).toList();
  }
}

final employeeExtraRepositoryProvider = Provider<EmployeeExtraRepository>((
  ref,
) {
  final remote = ref.watch(employeeExtraRemoteProvider);
  return EmployeeExtraRepository(remote);
});

EmployeePayrollProfileInfo _payrollProfileFromJson(Map<String, dynamic> json) {
  final insurance = json['insurancePolicy'] as Map<String, dynamic>?;
  final tax = json['taxPolicy'] as Map<String, dynamic>?;
  final attendanceBonus =
      json['attendanceBonusPolicy'] as Map<String, dynamic>?;

  return EmployeePayrollProfileInfo(
    isInsuranceApplicable: json['isInsuranceApplicable'] as bool? ?? false,
    isTaxApplicable: json['isTaxApplicable'] as bool? ?? false,
    isAttendanceBonusApplicable:
        json['isAttendanceBonusApplicable'] as bool? ?? false,
    insuranceSalary: _toDoubleOrNull(json['insuranceSalary']),
    dependentCount: json['dependentCount'] as int? ?? 0,
    taxCode: json['taxCode'] as String?,
    insurancePolicyName: insurance?['name'] as String?,
    taxPolicyName: tax?['name'] as String?,
    attendanceBonusPolicyName: attendanceBonus?['name'] as String?,
    attendanceBonusAmount: _toDoubleOrNull(attendanceBonus?['amount']),
    personalDeduction: _toDoubleOrNull(tax?['personalDeduction']),
    dependentDeduction: _toDoubleOrNull(tax?['dependentDeduction']),
  );
}

EmployeeJobHistory _jobHistoryFromJson(Map<String, dynamic> json) {
  final department = json['department'] as Map<String, dynamic>?;
  final position = json['position'] as Map<String, dynamic>?;

  return EmployeeJobHistory(
    id: json['id'] as String? ?? '',
    employeeId: json['employeeId'] as String? ?? '',
    departmentName: department?['name'] as String?,
    positionName: position?['name'] as String?,
    hireDate: _toDate(json['hireDate']),
    salary: _toDoubleOrNull(json['salary']),
    status: json['status'] as String? ?? '',
    effectiveFrom: _toDate(json['effectiveFrom']),
    effectiveTo: _toDate(json['effectiveTo']),
  );
}

DateTime? _toDate(dynamic value) {
  if (value == null) return null;
  if (value is DateTime) return value;
  if (value is String) return DateTime.tryParse(value)?.toLocal();
  return null;
}

double? _toDoubleOrNull(dynamic value) {
  if (value == null) return null;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value);
  return null;
}
