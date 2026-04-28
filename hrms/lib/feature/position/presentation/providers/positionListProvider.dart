import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_exception.dart';
import '../../data/repo/position_repository.dart';
import '../../domain/entities/position.dart';

final positionListProvider =
    AsyncNotifierProvider<PositionListNotifier, List<Position>>(() {
      return PositionListNotifier();
    });

class PositionListNotifier extends AsyncNotifier<List<Position>> {


  @override
  Future<List<Position>> build() async {
    final positionRepo = ref.read(positionRepositoryProvider);
    try {
      final positions = await positionRepo.getPositions();
      return positions;
    } catch (e) {
      throw AppException(e.toString());
    }
  }
}
