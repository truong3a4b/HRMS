class Department {
  final String id;
  final String name;
  final String? code;
  final String? description;

  Department({
    required this.id,
    required this.name,
    this.code,
    this.description,
  });
}