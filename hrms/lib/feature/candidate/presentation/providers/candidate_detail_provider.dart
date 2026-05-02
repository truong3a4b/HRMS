import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';

import '../../../account/data/repo/account_repo.dart';
import '../../../recruitment/data/repo/recruitment_repo.dart';
import '../../data/repo/candidate_repo.dart';

final candidateDetailProvider = FutureProvider.family.autoDispose((ref, String candidateId) async {
  try{
    final candidate = await ref.read(candidateRepoProvider).getCandidateDetail(candidateId);
    return candidate;
  }on AppException catch(e){
    rethrow;
  } catch(e, st){
    debugPrint('Candidate Detail Provider error: $e');
    debugPrintStack(stackTrace: st);
    throw AppException('Đã có lỗi xảy ra khi tải thông tin ứng viên');
  }
});