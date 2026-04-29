import '../../../../core/service/address/Ward.dart';
import '../../../../core/service/address/provine_summary.dart';
import '../../../employee/domain/entities/employee.dart';

abstract class Profile {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? avatar;

  final DateTime? dateOfBirth;
  final Gender? gender;
  final String? address;
  final ProvinceSummary? province;
  final Ward? ward;

  final String? maritalStatus;
  final String? nationality;
  final String? religion;

  final String? identityCardNumber;
  final DateTime? identityCardIssueDate;
  final String? frontIdentityCardImage;
  final String? backIdentityCardImage;

  const Profile({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.avatar,
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
    this.frontIdentityCardImage,
    this.backIdentityCardImage,
  });
}