import '../../../../core/error/app_exception.dart';

class User {
  final String id;
  final String email;
  final UserRole role;

  User({
    required this.id,
    required this.email,
    required this.role,
  });
}
enum UserRole {
  admin,
  hr,
  manager,
  employee,
  candidate,
}
extension UserRoleMapper on String {
  UserRole toUserRole() {
    switch (this) {
      case 'ADMIN':
        return UserRole.admin;
      case 'HR':
        return UserRole.hr;
      case 'MANAGER':
        return UserRole.manager;
      case 'EMPLOYEE':
        return UserRole.employee;
      case 'CANDIDATE':
        return UserRole.candidate;
      default:
        throw AppException('Vai trò không hợp lệ: $this');
    }
  }
}

extension UserRoleExtension on UserRole {
  String get toDisplayString {
    switch (this) {
      case UserRole.admin:
        return 'Quản trị viên';
      case UserRole.hr:
        return 'Nhân sự';
      case UserRole.manager:
        return 'Quản lý';
      case UserRole.employee:
        return 'Nhân viên';
      case UserRole.candidate:
        return 'Ứng viên';
    }
  }

}
