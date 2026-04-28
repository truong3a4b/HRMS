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
      throw AppException(e.response?.data['message'] ?? 'Lôi tải dữ liệu');
    }
  }

  //get position by id
  Future<PositionDto> getPositionById(String id) async {
    try {
      final response = await dio.get('/positions/$id');
      final data = response.data['data'] as Map<String, dynamic>;
      return PositionDto.fromJson(data);
    } on DioException catch (e) {
      debugPrint("PositionRemote getPositionById error: $e");
      throw AppException(e.response?.data['message'] ?? 'Lôi tải dữ liệu');
    }
  }

  //add position
  Future<void> addPosition(Map<String, dynamic> data) async {
    try {
      await dio.post('/positions', data: data);
    } on DioException catch (e) {
      debugPrint("PositionRemote addPosition error: $e");
      throw(AppException(e.response?.data['message'] ?? 'Lỗi thêm chức vụ'));
    }
  }

  //update position
  Future<void> updatePosition(String id, Map<String, dynamic> data) async {
    try {
      await dio.put('/positions/$id', data: data);
    } on DioException catch (e) {
      debugPrint("PositionRemote updatePosition error: $e");
      throw AppException(e.response?.data['message'] ?? 'Lỗi cập nhật chức vụ');
    }
  }

  //delete position
  Future<void> deletePosition(String id) async {
    try {
      await dio.delete('/positions/$id');
    } on DioException catch (e) {
      debugPrint("PositionRemote deletePosition error: $e");
      if(e.response?.data['errorCode'] == 'POSITION_HAS_ASSIGNED_EMPLOYEES'){
        throw AppException('Không thể xóa chức vụ này vì đã có nhân viên được gán');
      }
      throw AppException(e.response?.data['message'] ?? 'Lỗi xóa chức vụ');
    }
  }
}

final positionRemoteProvider = Provider<PositionRemote>((ref) {
  final dio = ref.watch(dioProvider);
  return PositionRemote(dio);
});