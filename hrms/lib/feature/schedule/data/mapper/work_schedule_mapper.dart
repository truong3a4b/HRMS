import '../../domain/entities/work_schedule.dart';
import '../models/work_schedule_dto.dart';

extension ScheduleShiftMapper on ScheduleShiftDto {
  ScheduleShift toEntity() {
    return ScheduleShift(
      id: id,
      code: code,
      name: name,
      startTime: startTime,
      endTime: endTime,
      isOvertime: isOvertime,
    );
  }
}

extension WorkScheduleMapper on WorkScheduleDto {
  WorkSchedule toEntity() {
    return WorkSchedule(
      id: id,
      date: date,
      workShifts: workShifts.map((shift) => shift.toEntity()).toList(),
    );
  }
}
