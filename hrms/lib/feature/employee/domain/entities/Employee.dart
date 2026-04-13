import 'dart:ui';

class Employee {
  final String id;
  final String employeeId;
  final String name;
  final String email;
  final String? phone;
  final String position;
  final String? avatar;
  final String? department;
  final EmployeeStatus? status;
  final DateTime? dateOfBirth;
  final Gender? gender;
  final String? address;
  final DateTime? hireDate;
  final double? salary;
  final String? bankAccount;
  final String? bankName;
  final String? maritalStatus;
  final String? nationality;
  final String? religion;
  final String? identityCardNumber;
  final DateTime? identityCardIssueDate;
  final String? frontIdentityCardImage;
  final String? backIdentityCardImage;

  Employee({
    required this.id,
    required this.employeeId,
    required this.name,
    required this.email,
    this.phone,
    required this.position,
    this.avatar,
    this.department,
    this.status,
    this.dateOfBirth,
    this.gender,
    this.address,
    this.hireDate,
    this.salary,
    this.bankAccount,
    this.bankName,
    this.maritalStatus,
    this.nationality,
    this.religion,
    this.identityCardNumber,
    this.identityCardIssueDate,
    this.frontIdentityCardImage,
    this.backIdentityCardImage,

  });

}

enum Gender {
  MALE,
  FEMALE,
  OTHER,
}

extension GenderExtension on Gender {
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