import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_exception.dart';
import '../../data/repo/work_shift_repository.dart';
import '../../domain/entities/work_shift.dart';

final workShiftListProvider =
    AsyncNotifierProvider<WorkShiftListNotifier, List<WorkShift>>(() {
      return WorkShiftListNotifier();
    });

class WorkShiftListNotifier extends AsyncNotifier<List<WorkShift>> {
  @override
  Future<List<WorkShift>> build() async {
    final repo = ref.read(workShiftRepositoryProvider);
    try {
      return repo.getWorkShifts();
    } catch (e) {
      throw AppException(e.toString());
    }
  }
}

final workShiftDetailProvider = FutureProvider.autoDispose
    .family<WorkShift, String>((ref, shiftId) {
      try {
        final repo = ref.read(workShiftRepositoryProvider);
        return repo.getWorkShiftById(shiftId);
      } on AppException catch (e) {
        debugPrint(e.toString());
        rethrow;
      } catch (e, st) {
        debugPrint(e.toString());
        debugPrint(st.toString());
        throw AppException('Đã có lỗi xảy ra, vui lòng thử lại');
      }
    });
