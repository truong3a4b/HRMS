class UpdatePositionRequest {
  final String id;
  final String name;
  final String? description;
  final List<String> permissionKeys;

  const UpdatePositionRequest({
    required this.id,
    required this.name,
    this.description,
    required this.permissionKeys,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
       if (description != null) 'description': description,
      'permissionKeys': permissionKeys,
    };
  }
}