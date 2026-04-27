import 'package:hrms/feature/employee/domain/entities/employee.dart';

class Department {
  final String id;
  final String name;
  final String? code;
  final String? description;
  final Employee? manager;
  final int? employeeCount;

  Department({
    required this.id,
    required this.name,
    this.code,
    this.description,
    this.manager,
    this.employeeCount,
  });
}