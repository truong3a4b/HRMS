class UpdateDepartmentRequest {
  final String id;
  final String name;
  final String? description;

  const UpdateDepartmentRequest({
    required this.id,
    required this.name,
    this.description,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'description': description,
    };
  }
}