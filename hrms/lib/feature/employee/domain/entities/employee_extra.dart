class EmployeePayrollProfileInfo {
  final bool isInsuranceApplicable;
  final bool isTaxApplicable;
  final bool isAttendanceBonusApplicable;
  final double? insuranceSalary;
  final int dependentCount;
  final String? taxCode;
  final String? insurancePolicyName;
  final String? taxPolicyName;
  final String? attendanceBonusPolicyName;
  final double? attendanceBonusAmount;
  final double? personalDeduction;
  final double? dependentDeduction;

  const EmployeePayrollProfileInfo({
    required this.isInsuranceApplicable,
    required this.isTaxApplicable,
    required this.isAttendanceBonusApplicable,
    this.insuranceSalary,
    required this.dependentCount,
    this.taxCode,
    this.insurancePolicyName,
    this.taxPolicyName,
    this.attendanceBonusPolicyName,
    this.attendanceBonusAmount,
    this.personalDeduction,
    this.dependentDeduction,
  });
}

class EmployeeJobHistory {
  final String id;
  final String employeeId;
  final String? departmentName;
  final String? positionName;
  final DateTime? hireDate;
  final double? salary;
  final String status;
  final DateTime? effectiveFrom;
  final DateTime? effectiveTo;

  const EmployeeJobHistory({
    required this.id,
    required this.employeeId,
    this.departmentName,
    this.positionName,
    this.hireDate,
    this.salary,
    required this.status,
    this.effectiveFrom,
    this.effectiveTo,
  });
}

extension EmployeeJobStatusX on String {
  String get employeeStatusLabel {
    switch (this) {
      case 'WORKING':
        return 'Đang làm việc';
      case 'ON_LEAVE':
        return 'Đang nghỉ phép';
      case 'RESIGNED':
        return 'Đã nghỉ việc';
      default:
        return this;
    }
  }
}
