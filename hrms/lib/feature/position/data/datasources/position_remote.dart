import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';

import '../../../../core/network/dio_client.dart';
import '../models/position_dto.dart';

class PositionRemote {
  final Dio dio;

  PositionRemote(this.dio);

  Future<List<PositionDto>> getPositions() async {
    try {
      final response = await dio.get('/positions');
      final data = response.data['data'] as List<dynamic>;
      return data.map((e) => PositionDto.fromJson(e)).toList();
    } on DioException catch (e) {
      debugPrint("PositionRemote getPositions error: $e");
      throw AppException('Failed to load positions: ${e.message}');
    }
  }
}

final positionRemoteProvider = Provider<PositionRemote>((ref) {
  final dio = ref.watch(dioProvider);
  return PositionRemote(dio);
});