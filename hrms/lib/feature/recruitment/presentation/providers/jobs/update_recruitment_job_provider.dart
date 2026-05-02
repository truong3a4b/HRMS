import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/feature/recruitment/domain/entities/recruitment_job_request.dart';

import '../../../../../core/error/app_exception.dart';
import '../../../data/repo/recruitment_repo.dart';

final updateRecruitmentJobProvider = FutureProvider.autoDispose.family<void,RecruitmentJobRequest>((ref, request) async {
  try {
    final repo = ref.read(recruitmentRepositoryProvider);
    await repo.updateRecruitmentJob(request);
  } on AppException catch (e) {
    rethrow;
  }
  catch (e, st) {
    debugPrint(e.toString());
    debugPrint(st.toString());
    throw AppException('Đã có lỗi xảy ra, vui lòng thử lại');
  }
});
