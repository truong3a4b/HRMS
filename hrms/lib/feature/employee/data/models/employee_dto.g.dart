// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'employee_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_EmployeeDto _$EmployeeDtoFromJson(Map<String, dynamic> json) => _EmployeeDto(
  id: json['id'] as String,
  employeeId: json['employeeId'] as String,
  name: json['name'] as String,
  email: json['email'] as String,
  phone: json['phone'] as String?,
  avatar: json['avatar'] as String?,
  status: json['status'] as String,
  dateOfBirth: json['dateOfBirth'] == null
      ? null
      : DateTime.parse(json['dateOfBirth'] as String),
  gender: json['gender'] as String?,
  address: json['address'] as String?,
  hireDate: json['hireDate'] == null
      ? null
      : DateTime.parse(json['hireDate'] as String),
  salary: json['salary'] as String?,
  bankAccount: json['bankAccount'] as String?,
  bank: json['bank'] == null
      ? null
      : BaseOptionDto.fromJson(json['bank'] as Map<String, dynamic>),
  maritalStatus: json['maritalStatus'] as String?,
  nationality: json['nationality'] as String?,
  religion: json['religion'] as String?,
  identityCardNumber: json['identityCardNumber'] as String?,
  identityCardIssueDate: json['identityCardIssueDate'] == null
      ? null
      : DateTime.parse(json['identityCardIssueDate'] as String),
  frontIdentityCardImage: json['frontIdentityCardImage'] as String?,
  backIdentityCardImage: json['backIdentityCardImage'] as String?,
  province: json['province'] == null
      ? null
      : BaseOptionDto.fromJson(json['province'] as Map<String, dynamic>),
  ward: json['ward'] == null
      ? null
      : BaseOptionDto.fromJson(json['ward'] as Map<String, dynamic>),
  userId: json['userId'] as String?,
  departmentId: json['departmentId'] as String?,
  positionId: json['positionId'] as String?,
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
  updatedAt: json['updatedAt'] == null
      ? null
      : DateTime.parse(json['updatedAt'] as String),
  user: json['user'] == null
      ? null
      : UserDto.fromJson(json['user'] as Map<String, dynamic>),
  department: json['department'] == null
      ? null
      : DepartmentDto.fromJson(json['department'] as Map<String, dynamic>),
  position: json['position'] == null
      ? null
      : PositionDto.fromJson(json['position'] as Map<String, dynamic>),
);

Map<String, dynamic> _$EmployeeDtoToJson(
  _EmployeeDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'employeeId': instance.employeeId,
  'name': instance.name,
  'email': instance.email,
  'phone': instance.phone,
  'avatar': instance.avatar,
  'status': instance.status,
  'dateOfBirth': instance.dateOfBirth?.toIso8601String(),
  'gender': instance.gender,
  'address': instance.address,
  'hireDate': instance.hireDate?.toIso8601String(),
  'salary': instance.salary,
  'bankAccount': instance.bankAccount,
  'bank': instance.bank,
  'maritalStatus': instance.maritalStatus,
  'nationality': instance.nationality,
  'religion': instance.religion,
  'identityCardNumber': instance.identityCardNumber,
  'identityCardIssueDate': instance.identityCardIssueDate?.toIso8601String(),
  'frontIdentityCardImage': instance.frontIdentityCardImage,
  'backIdentityCardImage': instance.backIdentityCardImage,
  'province': instance.province,
  'ward': instance.ward,
  'userId': instance.userId,
  'departmentId': instance.departmentId,
  'positionId': instance.positionId,
  'createdAt': instance.createdAt?.toIso8601String(),
  'updatedAt': instance.updatedAt?.toIso8601String(),
  'user': instance.user,
  'department': instance.department,
  'position': instance.position,
};
