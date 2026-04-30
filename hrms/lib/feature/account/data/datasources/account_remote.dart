import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/service/address/Ward.dart';
import 'package:hrms/core/service/address/provine_summary.dart';
import 'package:hrms/core/utils/extract_error.dart';
import 'package:hrms/core/utils/platform_file_actions.dart';
import 'package:hrms/feature/account/domain/entities/candidate.dart';
import 'package:hrms/feature/employee/domain/entities/employee.dart';

import '../../../../core/error/app_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../../../employee/data/models/employee_dto.dart';

class AccountRemote {
  final Dio dio;

  AccountRemote({required this.dio});

  Future<EmployeeDto> fetchEmployeeProfile() async {
    try {
      final response = await dio.get('/employees/me');

      return EmployeeDto.fromJson(response.data['data']);
    } on DioException catch (e) {
      print('Profile Remote getCurrentUser error: $e');
      throw AppException('Lỗi tải thông tin cá nhân');
    }
  }

  Future<Candidate> fetchCandidateProfile() async {
    try {
      final response = await dio.get('/recruitment/profile');

      return _candidateFromJson(response.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      print('Profile Remote getCurrentUser error: $e');
      throw AppException('Lỗi tải thông tin cá nhân');
    }
  }

  Future<bool> updateCandidateProfile(
    Map<String, dynamic> data, {
    PickedCvFile? cvFile,
  }) async {
    try {
      if (cvFile == null) {
        await dio.patch('/recruitment/profile', data: data);
        return true;
      }

      final formData = FormData.fromMap(data);
      formData.files.add(
        MapEntry(
          'cv',
          MultipartFile.fromBytes(cvFile.bytes, filename: cvFile.name),
        ),
      );

      await dio.patch(
        '/recruitment/profile',
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
          extra: {'noRetry': true},
        ),
      );
      return true;
    } on DioException catch (e) {
      final errorMessage = ExtractError.extractFirstError(e.response?.data);
      throw AppException(errorMessage);
    }
  }

  Future<List<String>> fetchPermissions() async {
    try {
      final response = await dio.get('/auth/my-permissions');
      final data = response.data['data']['permissions'] as List<dynamic>;
      return data.map((e) => e.toString()).toList();
    } on DioException catch (e) {
      print('Profile Remote fetchPermissions error: $e');
      throw AppException('Lỗi tải quyền truy cập');
    }
  }

  Candidate _candidateFromJson(Map<String, dynamic> json) {
    return Candidate(
      id: json['id']?.toString() ?? '',
      name: (json['fullName'] ?? json['name'] ?? 'NO NAME').toString(),
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString(),
      avatar: json['avatar']?.toString(),
      dateOfBirth: _parseDate(json['dateOfBirth']),
      gender: _parseGender(json['gender']),
      address: json['address']?.toString(),
      province: _parseProvince(json['province']),
      ward: _parseWard(json['ward']),
      maritalStatus: json['maritalStatus']?.toString(),
      nationality: json['nationality']?.toString(),
      religion: json['religion']?.toString(),
      identityCardNumber: json['identityCardNumber']?.toString(),
      identityCardIssueDate: _parseDate(json['identityCardIssueDate']),
      frontIdentityCardImage: json['frontIdentityCardImage']?.toString(),
      backIdentityCardImage: json['backIdentityCardImage']?.toString(),
      cvUrl: json['cvUrl']?.toString(),
    );
  }

  DateTime? _parseDate(dynamic value) {
    if (value == null) return null;
    if (value is DateTime) return value;
    return DateTime.tryParse(value.toString());
  }

  Gender? _parseGender(dynamic value) {
    switch (value?.toString()) {
      case 'MALE':
        return Gender.MALE;
      case 'FEMALE':
        return Gender.FEMALE;
      case 'OTHER':
        return Gender.OTHER;
      default:
        return null;
    }
  }

  ProvinceSummary? _parseProvince(dynamic value) {
    if (value is! Map<String, dynamic>) return null;
    final id = value['id'] ?? value['maTinhBNV'] ?? value['code'];
    final name = value['name'];
    if (id == null || name == null) return null;
    return ProvinceSummary(maTinhBNV: id.toString(), name: name.toString());
  }

  Ward? _parseWard(dynamic value) {
    if (value is! Map<String, dynamic>) return null;
    final id = value['id'] ?? value['code'];
    final name = value['name'];
    if (id == null || name == null) return null;
    return Ward(code: id.toString(), name: name.toString());
  }
}

final accountRemoteProvider = Provider<AccountRemote>((ref) {
  final dio = ref.watch(dioProvider);
  return AccountRemote(dio: dio);
});
