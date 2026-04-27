import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../auth/data/models/user_dto.dart';
import '../../../department/data/models/department_dto.dart';
import '../../../position/data/models/position_dto.dart';
import 'base_option_dto.dart';


part 'employee_dto.freezed.dart';
part 'employee_dto.g.dart';

@freezed
abstract class EmployeeDto with _$EmployeeDto {
  const factory EmployeeDto({
    required String id,
    required String employeeId,
    required String name,
    required String email,

    String? phone,
    String? avatar,
    required String status,

    DateTime? dateOfBirth,
    String? gender,
    String? address,
    DateTime? hireDate,

    String? salary,
    String? bankAccount,
    BaseOptionDto? bank,

    String? maritalStatus,
    String? nationality,
    String? religion,

    String? identityCardNumber,
    DateTime? identityCardIssueDate,

    String? frontIdentityCardImage,
    String? backIdentityCardImage,

    BaseOptionDto? province,
    BaseOptionDto? ward,

    String? userId,
    String? departmentId,
    String? positionId,

    DateTime? createdAt,
    DateTime? updatedAt,

    UserDto? user,
    DepartmentDto? department,
    PositionDto? position,
  }) = _EmployeeDto;

  factory EmployeeDto.fromJson(Map<String, dynamic> json) =>
      _$EmployeeDtoFromJson(json);
}
