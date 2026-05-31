class WorkShiftDto {
  final String id;
  final String code;
  final String name;
  final String startTime;
  final String endTime;
  final String? breakStartTime;
  final String? breakEndTime;
  final int lateGracePeriod;
  final int earlyLeaveGracePeriod;
  final String checkInStartTime;
  final String checkInEndTime;
  final String checkOutStartTime;
  final String checkOutEndTime;
  final bool isOvernight;
  final bool isOvertime;
  final double workUnits;
  final double overtimeMultiplier;
  final bool isActive;

  const WorkShiftDto({
    required this.id,
    required this.code,
    required this.name,
    required this.startTime,
    required this.endTime,
    this.breakStartTime,
    this.breakEndTime,
    required this.lateGracePeriod,
    required this.earlyLeaveGracePeriod,
    required this.checkInStartTime,
    required this.checkInEndTime,
    required this.checkOutStartTime,
    required this.checkOutEndTime,
    required this.isOvernight,
    required this.isOvertime,
    required this.workUnits,
    required this.overtimeMultiplier,
    required this.isActive,
  });

  static double _toDouble(dynamic value, {double fallback = 0}) {
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? fallback;
    return fallback;
  }

  static int _toInt(dynamic value, {int fallback = 0}) {
    if (value is num) return value.toInt();
    if (value is String) return int.tryParse(value) ?? fallback;
    return fallback;
  }

  factory WorkShiftDto.fromJson(Map<String, dynamic> json) {
    return WorkShiftDto(
      id: json['id'] as String,
      code: json['code'] as String,
      name: json['name'] as String,
      startTime: json['startTime'] as String,
      endTime: json['endTime'] as String,
      breakStartTime: json['breakStartTime'] as String?,
      breakEndTime: json['breakEndTime'] as String?,
      lateGracePeriod: _toInt(json['lateGracePeriod']),
      earlyLeaveGracePeriod: _toInt(json['earlyLeaveGracePeriod']),
      checkInStartTime: json['checkInStartTime'] as String,
      checkInEndTime: json['checkInEndTime'] as String,
      checkOutStartTime: json['checkOutStartTime'] as String,
      checkOutEndTime: json['checkOutEndTime'] as String,
      isOvernight: json['isOvernight'] as bool? ?? false,
      isOvertime: json['isOvertime'] as bool? ?? false,
      workUnits: _toDouble(json['workUnits']),
      overtimeMultiplier: _toDouble(json['overtimeMultiplier'], fallback: 1),
      isActive: json['isActive'] as bool? ?? true,
    );
  }
}
