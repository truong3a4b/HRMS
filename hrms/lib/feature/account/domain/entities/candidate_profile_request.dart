import '../../../../core/utils/platform_file_actions.dart';
import '../../../../core/service/address/Ward.dart';
import '../../../../core/service/address/provine_summary.dart';

class CandidateProfileRequest {
  final String fullName;
  final String? phone;
  final DateTime? dateOfBirth;
  final String? gender;
  final String? address;
  final ProvinceSummary? province;
  final Ward? ward;
  final String? maritalStatus;
  final String? nationality;
  final String? religion;
  final String? identityCardNumber;
  final DateTime? identityCardIssueDate;
  final PickedCvFile? cvFile;

  const CandidateProfileRequest({
    required this.fullName,
    this.phone,
    this.dateOfBirth,
    this.gender,
    this.address,
    this.province,
    this.ward,
    this.maritalStatus,
    this.nationality,
    this.religion,
    this.identityCardNumber,
    this.identityCardIssueDate,
    this.cvFile,
  });

  Map<String, dynamic> toJson() {
    return {
      'fullName': fullName,
      'phone': phone,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'gender': gender,
      'address': address,
      'province': province != null
          ? {
              'id': province!.maTinhBNV,
              'name': province!.name,
            }
          : null,
      'ward': ward != null
          ? {
              'id': ward!.code,
              'name': ward!.name,
            }
          : null,
      'maritalStatus': maritalStatus,
      'nationality': nationality,
      'religion': religion,
      'identityCardNumber': identityCardNumber,
      'identityCardIssueDate': identityCardIssueDate?.toIso8601String(),
    }..removeWhere((key, value) => value == null || value == '');
  }
}
