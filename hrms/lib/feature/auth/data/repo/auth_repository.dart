import '../../domain/entities/user.dart';
import '../datasources/auth_remote.dart';

class AuthRepository {
  final AuthRemote remote;

  AuthRepository(this.remote);

  Future<User> getCurrentUser() async {
    final userDto = await remote.getCurrentUser();
    final role = userDto.role.toUserRole();
    return User(id: userDto.id, email: userDto.email, role: role);
  }

  Future<bool> refreshToken() async {
    return await remote.refreshToken();
  }

  Future<User> login(String email, String password) async {
    final userDto = await remote.login(email, password);
    final role = userDto.role.toUserRole();
    return User(id: userDto.id, email: userDto.email, role: role);
  }

  Future<void> register(String email, String password) async {
    await remote.register(email, password);
  }

  Future<User> verifyOtp(String email, String otp) async {
    final userDto = await remote.verifyOtp(email, otp);
    final role = userDto.role.toUserRole();
    return User(id: userDto.id, email: userDto.email, role: role);
  }

  Future<void> logout() async {
    await Future.delayed(const Duration(seconds: 2));
  }
}
