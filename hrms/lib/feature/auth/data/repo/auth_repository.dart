import '../../../../core/error/app_exception.dart';
import '../datasources/auth_remote.dart';
import '../../domain/entities/user.dart';

class AuthRepository {
  final AuthRemote remote;

  AuthRepository(this.remote);


  Future<User> getCurrentUser() async {
    return User(id: '123', email: 'truong@gmail.com', role: UserRole.employee);
  }
  Future<bool> refreshToken() async {
    return true;
  }
  Future<User> login(String email, String password) async {
    final result = await remote.login(email, password);
    final role = mapRole(result.data.user.role);
    return User(id: result.data.user.id, email: result.data.user.email, role: role);
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

  Future<void> register(String email, String password) async {
    await remote.register(email, password);
  }

  Future<User> verifyOtp(String email, String otp) async {
    final result = await remote.verifyOtp(email, otp);
    final role = mapRole(result.data.user.role);
    return User(id: result.data.user.id, email: result.data.user.email, role: role);
  }

  Future<void> logout() async {
    await Future.delayed(const Duration(seconds: 2));
  }

}