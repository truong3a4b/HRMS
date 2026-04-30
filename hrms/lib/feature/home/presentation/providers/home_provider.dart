import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';
import 'package:hrms/feature/account/presentation/providers/profile_provider.dart';
import 'package:hrms/feature/auth/presentation/providers/auth_provider.dart';


import '../../../account/domain/entities/profile.dart';
import '../../../account/presentation/providers/permission_provider.dart';
import '../../../auth/domain/entities/user.dart';
import '../../../position/domain/entities/position.dart';

final homeProvider = AsyncNotifierProvider<HomeNotifier, HomeState>(
  () => HomeNotifier(),
);

class HomeNotifier extends AsyncNotifier<HomeState> {
  @override
  Future<HomeState> build() async {
    return _loadWithRetry();
  }

  Future<HomeState> _loadWithRetry() async {
    const maxRetry = 3;

    for (int attempt = 0; attempt < maxRetry; attempt++) {
      try {
        final result = await Future.wait([
          ref.watch(profileProvider.future),
          ref.watch(permissionProvider.future),
        ]);
        final me = result[0] as Profile;
        final permission = result[1] as Set<Permission>;
        final user = ref.watch(authNotifierProvider).value?.user;

        return HomeState(
          welcomeMessage: 'Chào mừng trở lại, ${me.name}!',
          currentDate: DateTime.now(),
          me: me,
          role: user?.role,
          permission: permission,
        );
      } on AppException catch (e, st) {
        if (attempt == maxRetry - 1) {
          Error.throwWithStackTrace(e, st);
        }

        await Future.delayed(Duration(seconds: attempt + 1));
        ref.invalidate(profileProvider);
        ref.invalidate(permissionProvider);
      } catch (e, st) {
        Error.throwWithStackTrace(e, st);
      }
    }

    throw AppException('Không thể tải dữ liệu trang chủ');
  }
}

class HomeState {
  final String? welcomeMessage;
  final DateTime? currentDate;
  final Profile? me;
  final UserRole? role;
  final Set<Permission>? permission;

  HomeState({this.welcomeMessage, this.currentDate, this.me, this.role, this.permission});

  HomeState copyWith({
    String? welcomeMessage,
    DateTime? currentDate,
    Profile? me,
    UserRole? role,
    Set<Permission>? permission,
  }) {
    return HomeState(
      welcomeMessage: welcomeMessage ?? this.welcomeMessage,
      currentDate: currentDate ?? this.currentDate,
      me: me ?? this.me,
      role: role ?? this.role,
      permission: permission ?? this.permission,
    );
  }
}
