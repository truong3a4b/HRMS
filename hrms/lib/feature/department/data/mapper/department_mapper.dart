import '../../../employee/domain/entities/employee.dart';
import '../../domain/entities/department.dart';
import '../models/department_dto.dart';

extension DepartmentMapper on DepartmentDto {
  Department toEntity() {
    return Department(
      id: id,
      name: name,
      code: code,
      description: description,
      manager: manager != null ? Employee(
        id: manager!['id'],
        name: manager!['name'],
        email: manager!['email'],
        employeeId: manager!['employeeId'],
      ) : null,
      employeeCount: employeeCount,
    );
  }
}