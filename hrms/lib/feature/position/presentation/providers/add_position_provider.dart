import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_exception.dart';
import '../../data/repo/position_repository.dart';
import '../../domain/entities/add_position_request.dart';

final addPositionProvider =
FutureProvider.autoDispose.family<void, AddPositionRequest>((ref, request) async {
  try {
    final repo = ref.read(positionRepositoryProvider);
    await repo.addPosition(request);
  } on AppException catch (e) {
    debugPrint(e.toString());
    throw e;
  } catch (e, st) {
    debugPrint(e.toString());
    debugPrint(st.toString());
    throw AppException('Đã có lỗi xảy ra, vui lòng thử lại');
  }
});