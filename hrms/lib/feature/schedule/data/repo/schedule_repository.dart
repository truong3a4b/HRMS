import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/work_schedule.dart';
import '../datasources/schedule_remote.dart';
import '../mapper/work_schedule_mapper.dart';

class ScheduleRepository {
  final ScheduleRemote remote;

  ScheduleRepository(this.remote);

  Future<List<WorkSchedule>> getMySchedule(String month) async {
    final dtos = await remote.getMySchedule(month);
    return dtos.map((dto) => dto.toEntity()).toList();
  }
}

final scheduleRepositoryProvider = Provider<ScheduleRepository>((ref) {
  final remote = ref.watch(scheduleRemoteProvider);
  return ScheduleRepository(remote);
});
