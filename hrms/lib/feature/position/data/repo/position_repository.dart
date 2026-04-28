import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/feature/position/data/datasources/position_remote.dart';
import 'package:hrms/feature/position/data/mapper/posittion_mapper.dart';
import 'package:hrms/feature/position/domain/entities/position.dart';

import '../../domain/entities/add_position_request.dart';
import '../models/update_position_request.dart';

class PositionRepository {
  final PositionRemote remote;

  PositionRepository(this.remote);

  Future<List<Position>> getPositions() async {
    final dtos = await remote.getPositions();
    return dtos.map((dto) => dto.toEntity()).toList();
  }

  //add position
  Future<void> addPosition(AddPositionRequest request) async {
    await remote.addPosition(request.toJson());
  }

  //get position by id
  Future<Position> getPositionById(String id) async {
    final dto = await remote.getPositionById(id);
    return dto.toEntity();
  }

  //update position
  Future<void> updatePosition(UpdatePositionRequest request) async {
    await remote.updatePosition(request.id, request.toJson());
  }

  //delete position
  Future<void> deletePosition(String id) async {
    await remote.deletePosition(id);
  }
}

final positionRepositoryProvider = Provider<PositionRepository>((ref) {
  final remote = ref.watch(positionRemoteProvider);
  return PositionRepository(remote);
});
