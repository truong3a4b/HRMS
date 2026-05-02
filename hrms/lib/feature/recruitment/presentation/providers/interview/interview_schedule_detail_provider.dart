import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';

import '../../../data/repo/recruitment_repo.dart';
import '../../../domain/entities/interview_schedule.dart';


final interviewScheduleDetailProvider =
FutureProvider.autoDispose.family<InterviewSchedule, ({String applicationId, String scheduleId})>((ref, request) async {
  try{
    final repository = ref.watch(recruitmentRepositoryProvider);

    final schedule = await repository.getInterviewScheduleById(applicationId: request.applicationId, interviewScheduleId: request.scheduleId);
    return schedule;
  } on AppException catch (e) {
    rethrow;
  } catch (e, st){
    debugPrint('InterviewScheduleDetailProvider error: $e');
    debugPrintStack(stackTrace: st);
    throw AppException('Lỗi tải chi tiết lịch phỏng vấn');
  }
});