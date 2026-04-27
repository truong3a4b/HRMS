import 'package:hrms/feature/account/data/datasources/profile_remote.dart';

import '../../../../core/error/app_exception.dart';
import '../../../auth/domain/entities/user.dart';

class ProfileRepository {
  final ProfileRemote remote;

  ProfileRepository(this.remote);

  Future<User> fetchProfile() async {
    final userdto = await remote.fetchProfile();
    final role = mapRole(userdto.role);
    return User(id: userdto.id, email: userdto.email, role: role);
  }

  UserRole mapRole(String role) {
    switch (role) {
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
        throw AppException('Vai trò không hợp lệ');
    }
  }
}