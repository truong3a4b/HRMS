import '../../../department/data/mapper/department_mapper.dart';
import '../../../position/data/mapper/posittion_mapper.dart';
import '../../domain/entities/recruitment_job.dart';
import '../models/recruitment_job_dto.dart';

extension RecruitmentJobDtoMapper on RecruitmentJobDto {
  RecruitmentJob toEntity() {
    return RecruitmentJob(
      id: id,
      title: title,
      description: description ?? '',
      requirements: requirements ?? '',
      benefits: benefits ?? '',
      salaryMin: salaryMin?.toDoubleValue(),
      salaryMax: salaryMax?.toDoubleValue(),
      quantity: quantity ?? 0,
      deadline: deadline,
      status: status.toRecruitmentJobStatus(),
      position: position?.toEntity(),
      department: department?.toEntity(),
      isApplied: applied ?? false,
    );
  }
}

extension RecruitmentJobDtoListMapper on List<RecruitmentJobDto> {
  List<RecruitmentJob> toEntityList() {
    return map((e) => e.toEntity()).toList();
  }
}

extension RecruitmentJobStatusMapper on String {
  RecruitmentJobStatus toRecruitmentJobStatus() {
    switch (this) {
      case 'OPEN':
        return RecruitmentJobStatus.OPEN;
      case 'CLOSED':
        return RecruitmentJobStatus.CLOSED;
      case 'CANCELLED':
        return RecruitmentJobStatus.CANCELLED;
      default:
        throw Exception('Trạng thái tin tuyển dụng không hợp lệ: $this');
    }
  }
}

extension SalaryMapper on String {
  double? toDoubleValue() {
    return double.tryParse(this);
  }
}