class ScheduleShiftDto {
  final String id;
  final String code;
  final String name;
  final String startTime;
  final String endTime;
  final bool isOvertime;

  const ScheduleShiftDto({
    required this.id,
    required this.code,
    required this.name,
    required this.startTime,
    required this.endTime,
    required this.isOvertime,
  });

  factory ScheduleShiftDto.fromJson(Map<String, dynamic> json) {
    return ScheduleShiftDto(
      id: json['id'] as String,
      code: json['code'] as String? ?? '',
      name: json['name'] as String? ?? '',
      startTime: json['startTime'] as String? ?? '',
      endTime: json['endTime'] as String? ?? '',
      isOvertime: json['isOvertime'] as bool? ?? false,
    );
  }
}

class WorkScheduleDto {
  final String id;
  final DateTime date;
  final List<ScheduleShiftDto> workShifts;

  const WorkScheduleDto({
    required this.id,
    required this.date,
    required this.workShifts,
  });

  factory WorkScheduleDto.fromJson(Map<String, dynamic> json) {
    return WorkScheduleDto(
      id: json['id'] as String,
      date: _toDate(json['date']),
      workShifts: (json['workShifts'] as List<dynamic>? ?? const [])
          .map(
            (item) => ScheduleShiftDto.fromJson(item as Map<String, dynamic>),
          )
          .toList(),
    );
  }
}

DateTime _toDate(dynamic value) {
  if (value is DateTime) return value;
  if (value is String) {
    return DateTime.tryParse(value)?.toLocal() ?? DateTime(0);
  }
  return DateTime(0);
}
