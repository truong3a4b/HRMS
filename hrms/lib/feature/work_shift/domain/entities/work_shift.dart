class WorkShift {
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

  const WorkShift({
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
}
