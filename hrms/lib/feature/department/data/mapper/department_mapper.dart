import '../../domain/entities/department.dart';
import '../models/department_dto.dart';

extension DepartmentMapper on DepartmentDto {
  Department toEntity() {
    return Department(
      id: id,
      name: name,
      code: code,
      description: description,
    );
  }
}