import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';
import '../../../../auth/domain/entities/user.dart';
import '../../../../auth/presentation/providers/user_provider.dart';
import '../../../data/repo/recruitment_repo.dart';

final jobApplicationDetailProvider = FutureProvider.family.autoDispose((ref, String applicationId) async {
  try{
    final user = ref.watch(userProvider).value;
    final repo = ref.read(recruitmentRepositoryProvider);

    if (user?.role == UserRole.candidate) {
      return repo.fetchCandidateApplicationDetail(applicationId);
    }

    return repo.getApplicationById(applicationId);
  } on Exception catch (e) {
    rethrow;
  } catch (e, st){
    debugPrint('JobApplicationDetailProvider error: $e');
    debugPrintStack(stackTrace: st);
    throw AppException('Lỗi tải chi tiết ứng tuyển');
  }
});