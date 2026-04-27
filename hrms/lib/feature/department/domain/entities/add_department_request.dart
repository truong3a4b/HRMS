class AddDepartmentRequest {
  final String name;
  final String? description;


  AddDepartmentRequest({
    required this.name,
    this.description,

  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      if (description != null) 'description': description,
    };
  }
}