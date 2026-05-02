import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';

import '../../../data/repo/recruitment_repo.dart';

final jobApplicationDetailProvider = FutureProvider.family.autoDispose((ref, String applicationId) async {
  try{
    final repository = ref.watch(recruitmentRepositoryProvider);
    final application = await repository.getApplicationById(applicationId);
    return application;
  } on Exception catch (e) {
    rethrow;
  } catch (e, st){
    debugPrint('JobApplicationDetailProvider error: $e');
    debugPrintStack(stackTrace: st);
    throw AppException('Lỗi tải chi tiết ứng tuyển');
  }
});