class AddEmployeeRequest {
  final String name;
  final String email;
  final String? phone;
  final String? position;
  final String? avatar;
  final String? department;
  final String? status;
  final DateTime? dateOfBirth;
  final String? gender;
  final String? address;
  final int? provinceId;
  final int? wardId;
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

  AddEmployeeRequest({
    required this.name,
    required this.email,
    this.phone,
    this.position,
    this.avatar,
    this.department,
    this.status,
    this.dateOfBirth,
    this.gender,
    this.address,
    this.provinceId,
    this.wardId,
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