import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/work_shift.dart';
import '../datasources/work_shift_remote.dart';
import '../mapper/work_shift_mapper.dart';

class WorkShiftRepository {
  final WorkShiftRemote remote;

  WorkShiftRepository(this.remote);

  Future<List<WorkShift>> getWorkShifts() async {
    final dtos = await remote.getWorkShifts();
    return dtos.map((dto) => dto.toEntity()).toList();
  }

  Future<WorkShift> getWorkShiftById(String id) async {
    final dto = await remote.getWorkShiftById(id);
    return dto.toEntity();
  }
}

final workShiftRepositoryProvider = Provider<WorkShiftRepository>((ref) {
  final remote = ref.watch(workShiftRemoteProvider);
  return WorkShiftRepository(remote);
});
