import 'package:hrms/feature/employee/data/mapper/employee_mapper.dart';

import '../../domain/entities/interview_schedule.dart';
import '../models/interview_schedule_dto.dart';

extension InterviewScheduleDtoMapper on InterviewScheduleDto {
  InterviewSchedule toEntity({String? applicationId}) {
    return InterviewSchedule(
      id: id,
      jobApplicationId: jobApplicationId ?? applicationId ?? '',
      title: title,
      type: type,
      scheduledAt: scheduledAt ?? DateTime.now(),
      interviewerNotes: interviewerNotes,
      candidateResponseAt: candidateResponseAt,
      candidateResponseNote: candidateResponseNote,
      location: location ?? '-',
      status: _mapInterviewStatus(status),
      createdBy: createdBy?.toEntity(),
      createdAt: createdAt ?? DateTime.now(),
      updatedAt: updatedAt,
    );
  }
}


InterviewStatus _mapInterviewStatus(String value) {
  switch (value.toUpperCase()) {
    case 'INVITED':
      return InterviewStatus.invited;
    case 'CONFIRMED':
      return InterviewStatus.confirmed;
    case 'DECLINED':
      return InterviewStatus.declined;
    case 'COMPLETED':
      return InterviewStatus.completed;
    case 'CANCELLED':
      return InterviewStatus.cancelled;
    default:
      return InterviewStatus.invited;
  }
}
