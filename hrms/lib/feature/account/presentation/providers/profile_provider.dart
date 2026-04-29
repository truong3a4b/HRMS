import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';
import 'package:hrms/feature/account/domain/entities/profile.dart';
import 'package:hrms/feature/auth/domain/entities/user.dart';
import 'package:hrms/feature/auth/presentation/providers/user_provider.dart';
import 'package:hrms/feature/employee/domain/entities/employee.dart';

import '../../data/repo/account_repo.dart';

final profileProvider = FutureProvider<Profile>((ref) async {
  try {
    final user = await ref.read(userProvider.future);
    final repo = ref.read(accountRepoProvider);
    if(user.role == UserRole.candidate) {
      return await repo.fetchCandidateProfile();
    } else {
      return await repo.fetchEmployeeProfile();
    }
  } on AppException catch (e) {
    debugPrint('Profile Provider error: $e');
    rethrow;
  } catch (e, st) {
    debugPrint('Profile Provider error: $e');
    debugPrintStack(stackTrace: st);
    throw AppException('Lỗi tải thông tin cá nhân');
  }
});
