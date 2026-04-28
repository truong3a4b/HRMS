class AddPositionRequest {
  final String name;
  final String? description;
  final List<String> permissionKeys;

  const AddPositionRequest({
    required this.name,
    this.description,
    required this.permissionKeys,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      if (description != null && description!.trim().isNotEmpty)
        'description': description,
      'permissionKeys': permissionKeys,
    };
  }
}
