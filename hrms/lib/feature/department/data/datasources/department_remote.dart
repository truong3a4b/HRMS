import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';

import '../../../../core/network/dio_client.dart';
import '../models/department_dto.dart';

class DepartmentRemote {
  final Dio dio;

  DepartmentRemote({required this.dio});
  Future<List<DepartmentDto>> getDepartments() async {
    try{
      final response = await dio.get('/departments');
      final data = response.data['data'] as List<dynamic>;
      return data.map((e) => DepartmentDto.fromJson(e)).toList();
    } on DioException catch (e) {
      debugPrint('DepartmentRemote getDepartments error: $e');
      throw AppException(e.response?.data['message'] ?? 'Lỗi tải dữ liệu');
    }
  }

  //get department by id
  Future<DepartmentDto> getDepartmentById(String id) async {
    try{
      final response = await dio.get('/departments/$id');
      final data = response.data['data'] as Map<String, dynamic>;
      return DepartmentDto.fromJson(data);
    } on DioException catch (e) {
      debugPrint('DepartmentRemote getDepartmentById error: $e');
      throw AppException(e.response?.data['message'] ?? 'Lỗi tải dữ liệu');
    }
  }

  //add department
  Future<void> addDepartment(Map<String, dynamic> data) async {
    try{
      await dio.post('/departments', data: data);
    } on DioException catch (e) {
      debugPrint('DepartmentRemote addDepartment error: $e');
      throw AppException(e.response?.data['message'] ?? 'Lỗi thêm phòng ban');
    }
  }

  //update department
  Future<void> updateDepartment(String id, Map<String, dynamic> data) async {
    try{
      await dio.patch('/departments/$id/basic', data: data);
    } on DioException catch (e) {
      debugPrint('DepartmentRemote updateDepartment error: $e');
      throw AppException(e.response?.data['message'] ?? 'Lỗi cập nhật phòng ban');
    }
  }

  //select Manager
  Future<void> selectManager(String departmentId, String managerId) async {
    try{
      await dio.patch('/departments/$departmentId/manager', data: {'managerId': managerId});
    } on DioException catch (e) {
      debugPrint('DepartmentRemote selectManager error: $e');
      throw AppException(e.response?.data['message'] ?? 'Lỗi chọn trưởng phòng');
    }
  }
  //delete department
  Future<void> deleteDepartment(String id) async {
    try{
      await dio.delete('/departments/$id');
    } on DioException catch (e) {
      debugPrint('DepartmentRemote deleteDepartment error: $e');
      final errorCode = e.response?.data['errorCode'];
      if (errorCode == 'DEPARTMENT_HAS_ASSIGNED_EMPLOYEES') {
        throw AppException('Không thể xóa phòng ban vì còn nhân viên');
      }
      throw AppException(e.response?.data['message'] ?? 'Lỗi xóa phòng ban');
    }
  }


}

final departmentRemoteProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return DepartmentRemote(dio: dio);

});