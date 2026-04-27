import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/feature/position/data/datasources/position_remote.dart';
import 'package:hrms/feature/position/data/mapper/posittion_mapper.dart';
import 'package:hrms/feature/position/domain/position.dart';

class PositionRepository {
  final PositionRemote remote;

  PositionRepository(this.remote);

  Future<List<Position>> getPositions() async {
    final dtos = await remote.getPositions();
    return dtos.map((dto) => dto.toEntity()).toList();
  }
}

final positionRepositoryProvider = Provider<PositionRepository>((ref) {
  final remote = ref.watch(positionRemoteProvider);
  return PositionRepository(remote);
});
