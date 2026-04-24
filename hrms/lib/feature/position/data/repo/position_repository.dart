import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/feature/position/data/datasources/position_remote.dart';
import 'package:hrms/feature/position/domain/position.dart';

class PositionRepository {
  final PositionRemote remote;

  PositionRepository(this.remote);

  Future<List<Position>> getPositions() async {
    await Future.delayed(const Duration(seconds: 2));
    final List<Position> positions = [
      Position(id: '1', name: 'Nhân viên'),
      Position(id: '2', name: 'Trưởng phòng'),
      Position(id: '3', name: 'Giám đốc'),
    ];
    return positions;
  }
}

final positionRepositoryProvider = Provider<PositionRepository>((ref) {
  final remote = ref.watch(positionRemoteProvider);
  return PositionRepository(remote);
});
