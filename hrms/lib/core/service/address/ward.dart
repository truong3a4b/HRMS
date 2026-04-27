class Ward {
  final String code;
  final String name;

  Ward({
    required this.code,
    required this.name,
  });

  factory Ward.fromJson(Map<String, dynamic> json) {
    return Ward(
      code: json['maphuongxa'].toString(),
      name: json['tenphuongxa'],
    );
  }
}
