class RecruitmentJobRequest {
  final String? id;
  final String positionId;
  final String departmentId;
  final String title;
  final String description;
  final String requirements;
  final String benefits;
  final double salaryMin;
  final double salaryMax;
  final int quantity;
  final DateTime deadline;
  final String? status;

  RecruitmentJobRequest({
    this.id,
    required this.positionId,
    required this.departmentId,
    required this.title,
    required this.description,
    required this.requirements,
    required this.benefits,
    required this.salaryMin,
    required this.salaryMax,
    required this.quantity,
    required this.deadline,
    this.status,
  });

  Map<String, dynamic> toJson() {
    return {
      'positionId': positionId,
      'departmentId': departmentId,
      'title': title,
      'description': description,
      'requirements': requirements,
      'benefits': benefits,
      'salaryMin': salaryMin,
      'salaryMax': salaryMax,
      'quantity': quantity,
      'deadline': deadline.toIso8601String(),
      if (status != null) 'status': status,
    };
  }
}