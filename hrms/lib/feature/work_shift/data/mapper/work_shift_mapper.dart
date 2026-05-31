import '../../domain/entities/work_shift.dart';
import '../models/work_shift_dto.dart';

extension WorkShiftMapper on WorkShiftDto {
  WorkShift toEntity() {
    return WorkShift(
      id: id,
      code: code,
      name: name,
      startTime: startTime,
      endTime: endTime,
      breakStartTime: breakStartTime,
      breakEndTime: breakEndTime,
      lateGracePeriod: lateGracePeriod,
      earlyLeaveGracePeriod: earlyLeaveGracePeriod,
      checkInStartTime: checkInStartTime,
      checkInEndTime: checkInEndTime,
      checkOutStartTime: checkOutStartTime,
      checkOutEndTime: checkOutEndTime,
      isOvernight: isOvernight,
      isOvertime: isOvertime,
      workUnits: workUnits,
      overtimeMultiplier: overtimeMultiplier,
      isActive: isActive,
    );
  }
}
