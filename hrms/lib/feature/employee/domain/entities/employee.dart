import 'dart:ui';

import 'package:hrms/core/service/bank/bank.dart';
import 'package:hrms/feature/department/domain/entities/department.dart';

import '../../../account/domain/entities/profile.dart';
import '../../../position/domain/entities/position.dart';

class Employee extends Profile {
  final String employeeId;
  final Position? position;
  final Department? department;
  final EmployeeStatus? status;
  final DateTime? hireDate;
  final double? salary;
  final String? bankAccount;
  final Bank? bank;

  Employee({
    required super.id,
    required this.employeeId,
    required super.name,
    required super.email,
    super.phone,
    super.avatar,
    super.dateOfBirth,
    super.gender,
    super.address,
    super.province,
    super.ward,
    super.maritalStatus,
    super.nationality,
    super.religion,
    super.identityCardNumber,
    super.identityCardIssueDate,
    super.frontIdentityCardImage,
    super.backIdentityCardImage,
    this.position,
    this.department,
    this.status,
    this.hireDate,
    this.salary,
    this.bankAccount,
    this.bank,
  });
}

enum Gender {
  MALE,
  FEMALE,
  OTHER,
}

extension GenderExtension on Gender {
  String get id{
    switch (this) {
      case Gender.MALE:
        return 'MALE';
      case Gender.FEMALE:
        return 'FEMALE';
      case Gender.OTHER:
        return 'OTHER';
    }
  }
  String get displayName {
    switch (this) {
      case Gender.MALE:
        return 'Nam';
      case Gender.FEMALE:
        return 'Nữ';
      case Gender .OTHER:
        return 'Khác';
    }
  }
}
enum EmployeeStatus {
  WORKING,
  ON_LEAVE,
  RESIGNED,
}

extension EmployeeStatusExtension on EmployeeStatus {
  String get displayName {
    switch (this) {
      case EmployeeStatus.WORKING:
        return 'Đang làm việc';
      case EmployeeStatus.ON_LEAVE:
        return 'Đang nghỉ phép';
      case EmployeeStatus.RESIGNED:
        return 'Đã nghỉ việc';
    }
  }
  Color get color {
    switch (this) {
      case EmployeeStatus.WORKING:
        return Color(0xFF31F309); // Green
      case EmployeeStatus.ON_LEAVE:
        return Color(0xFFFFC107); // Amber
      case EmployeeStatus.RESIGNED:
        return Color(0xFFF44336); // Red
    }
  }
}