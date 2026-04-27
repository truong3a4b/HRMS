class JobRequest {
  final String id;
  final String? positionId;
  final String? departmentId;
  final double? salary;
  final DateTime? hireDate;

  JobRequest({
    required this.id,
    this.positionId,
    this.departmentId,
    this.salary,
    this.hireDate,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      if (positionId != null) 'positionId': positionId,
      if (departmentId != null) 'departmentId': departmentId,
      if (salary != null) 'salary': salary,
      if (hireDate != null) 'hireDate': hireDate!.toIso8601String(),
      'effectiveFrom': DateTime.now().toIso8601String(),

    };
  }
}