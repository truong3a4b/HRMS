class Position {
  final String id;
  final String name;
  final String? code;
  final String? description;

  Position({
    required this.id,
    required this.name,
    this.code,
    this.description,
  });
}