import 'package:hrms/feature/employee/data/mapper/employee_mapper.dart';
import 'package:hrms/feature/recruitment/data/mapper/recruitment_job_mapper.dart';
import '../../../candidate/data/mapper/candidate_mapper.dart';
import '../../../candidate/domain/entities/candidate.dart';
import '../../../department/data/mapper/department_mapper.dart';
import '../../../position/data/mapper/posittion_mapper.dart';
import '../../domain/entities/job_application.dart';
import '../models/job_application_dto.dart';
import 'interview_evaluation_mapper.dart';
import 'interview_schedule_mapper.dart';
extension JobApplicationMapper on JobApplicationDto {
  JobApplication toEntity() {


    return JobApplication(
      id: id,
      candidate: Candidate(
        id: candidateId!,
        name: candidateName ?? 'NO NAME',
        email: candidateEmail!,
        phone: candidatePhone,
        address: candidateAddress,
        gender: candidateGender?.toGender(),
        dateOfBirth: candidateBirthDate,
        cvUrl: candidateCvUrl,
      ),
      job: recruitmentJob.toEntity(),
      position: position.toEntity(),
      department: department.toEntity(),
      status: _mapApplicationStatus(status),
      proposedSalary: proposedSalary,
      coverLetter: coverLetter,
      notes: notes,
      appliedAt: appliedAt,
      updatedAt: updatedAt,
      rejectedAt: rejectedAt,
      offerSentAt: offerSentAt,
      offerRespondedAt: offerRespondedAt,
      onboardedAt: onboardedAt,
      interviewSchedules: interviewSchedules.map((e) => e.toEntity(applicationId: id)).toList(),
      interviewEvaluations: evaluations.map((e) => e.toEntity()).toList(),
    );
  }
}

JobApplicationStatus _mapApplicationStatus(String value) {
  switch (value.toUpperCase()) {
    case 'APPLIED':
      return JobApplicationStatus.applied;
    case 'INTERVIEW_INVITED':
      return JobApplicationStatus.interviewInvited;
    case 'INTERVIEW_CONFIRMED':
      return JobApplicationStatus.interviewConfirmed;
    case 'INTERVIEW_DECLINED':
      return JobApplicationStatus.interviewDeclined;
    case 'INTERVIEW_COMPLETED':
      return JobApplicationStatus.interviewCompleted;
    case 'APPROVED':
      return JobApplicationStatus.approved;
    case 'REJECTED':
      return JobApplicationStatus.rejected;
    case 'OFFER_SENT':
      return JobApplicationStatus.offerSent;
    case 'OFFER_ACCEPTED':
      return JobApplicationStatus.offerAccepted;
    case 'OFFER_DECLINED':
      return JobApplicationStatus.offerDeclined;
    case 'ONBOARDED':
      return JobApplicationStatus.onboarded;
    default:
      return JobApplicationStatus.applied;
  }
}



