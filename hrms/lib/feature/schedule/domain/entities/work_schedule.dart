class ScheduleShift {
  final String id;
  final String code;
  final String name;
  final String startTime;
  final String endTime;
  final bool isOvertime;

  const ScheduleShift({
    required this.id,
    required this.code,
    required this.name,
    required this.startTime,
    required this.endTime,
    required this.isOvertime,
  });
}

class WorkSchedule {
  final String id;
  final DateTime date;
  final List<ScheduleShift> workShifts;

  const WorkSchedule({
    required this.id,
    required this.date,
    required this.workShifts,
  });
}
