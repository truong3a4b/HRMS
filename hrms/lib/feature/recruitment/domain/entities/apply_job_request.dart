import '../../../../core/service/address/Ward.dart';
import '../../../../core/service/address/provine_summary.dart';
import '../../../../core/utils/platform_file_actions.dart';

class ApplyJobRequest {
  final String recruitmentJobId;

  final String fullName;
  final String? phone;
  final DateTime? dateOfBirth;
  final String? gender;

  final String? address;
  final ProvinceSummary? province;
  final Ward? ward;


  final PickedCvFile? cvFile;

  final String? coverLetter;
  final String? notes;

  const ApplyJobRequest({
    required this.recruitmentJobId,
    required this.fullName,
    this.phone,
    this.dateOfBirth,
    this.gender,
    this.address,
    this.province,
    this.ward,
    this.cvFile,
    this.coverLetter,
    this.notes,
  });

  Map<String, dynamic> toJson() {
    return {
      'recruitmentJobId': recruitmentJobId,
      'fullName': fullName.trim(),
      'phone': phone,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'gender': gender,
      'address': address,
      'province': province == null
          ? null
          : {
        'id': province!.maTinhBNV,
        'name': province!.name,
      },
      'ward': ward == null
          ? null
          : {
        'id': ward!.code,
        'name': ward!.name,
      },
      'coverLetter': coverLetter,
      'notes': notes,
    }..removeWhere((key, value) => value == null || value == '');
  }
}