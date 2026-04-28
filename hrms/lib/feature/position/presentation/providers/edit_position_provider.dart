import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_exception.dart';
import '../../data/models/update_position_request.dart';
import '../../data/repo/position_repository.dart';
import '../../domain/entities/position.dart';

final positionDetailProvider = FutureProvider.autoDispose
    .family<Position, String>((ref, positionId) {
      try {
        final repo = ref.read(positionRepositoryProvider);
        return repo.getPositionById(positionId);
      } on AppException catch (e) {
        debugPrint(e.toString());
        throw e;
      } catch (e, st) {
        debugPrint(e.toString());
        debugPrint(st.toString());
        throw AppException('Đã có lỗi xảy ra, vui lòng thử lại');
      }
    });

final updatePositionProvider = FutureProvider.autoDispose
    .family<void, UpdatePositionRequest>((ref, request) {
      try {
        final repo = ref.read(positionRepositoryProvider);
        return repo.updatePosition(request);
      } on AppException catch (e) {
        debugPrint(e.toString());
        throw e;
      } catch (e, st) {
        debugPrint(e.toString());
        debugPrint(st.toString());
        throw AppException('Đã có lỗi xảy ra, vui lòng thử lại');
      }
    });

final deletePositionProvider = FutureProvider.autoDispose.family<void, String>((
  ref,
  positionId,
) {
  try {
    final repo = ref.read(positionRepositoryProvider);
    return repo.deletePosition(positionId);
  } on AppException catch (e) {
    debugPrint(e.toString());
    throw e;
  } catch (e, st) {
    debugPrint(e.toString());
    debugPrint(st.toString());
    throw AppException('Đã có lỗi xảy ra, vui lòng thử lại');
  }
});
