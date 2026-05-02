

import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/share/models/app_response.dart';
import '../models/candidate_dto.dart';

class CandidateRemote {
  final Dio dio;

  CandidateRemote({required this.dio});

  // Lấy danh sách ứng viên
  Future<List<CandidateDto>> fetchCandidates({
    String? search,
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await dio.get(
        '/candidates',
        queryParameters: {
          'search': search,
          'page': page,
          'limit': limit,
        },
      );
      final appResponse = AppResponse.fromJson(response.data);
      final data = appResponse.data['items'] as List<dynamic>;
      return data.map((e) => CandidateDto.fromJson(e)).toList();
    } on DioException catch (e) {
      debugPrint('CandidateRemote fetchCandidates error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi tải danh sách ứng viên',
      );
    }
  }

  // Lấy thông tin chi tiết của ứng viên theo ID
  Future<CandidateDto> fetchCandidateById(String id) async {
    try {
      final response = await dio.get('/candidates/$id');
      final appResponse = AppResponse.fromJson(response.data);
      return CandidateDto.fromJson(appResponse.data);
    } on DioException catch (e) {
      debugPrint('CandidateRemote fetchCandidateById error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi tải thông tin ứng viên',
      );
    }
  }

}

final candidateRemoteProvider = Provider<CandidateRemote>((ref) {
  final dio = ref.watch(dioProvider);
  return CandidateRemote(dio: dio);
});
