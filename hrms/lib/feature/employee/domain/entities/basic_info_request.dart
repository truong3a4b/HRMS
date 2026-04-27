import 'package:hrms/core/service/address/Ward.dart';
import 'package:hrms/core/service/address/provine_summary.dart';

import '../../../../core/service/bank/bank.dart';

class BasicInfoRequest {
  final String id;
  final String? name;
  final String? phone;
  final String? avatar;
  final DateTime? dateOfBirth;
  final String? gender;
  final String? address;
  final ProvinceSummary? province;
  final Ward? ward;
  final String? bankAccount;
  final Bank? bank;

  BasicInfoRequest({
    required this.id,
    this.name,
    this.phone,
    this.avatar,
    this.dateOfBirth,
    this.gender,
    this.address,
    this.province,
    this.ward,
    this.bankAccount,
    this.bank,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'avatar': avatar,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'gender': gender,
      'address': address,
      'province': province != null ? {
        'id': province!.maTinhBNV,
        'name': province!.name,
      } : null,
      'ward': ward != null ? {
        'id': ward!.code,
        'name': ward!.name,
      } : null,
      'bankAccount': bankAccount,
      'bank': bank != null ? {
        'id': bank!.id,
        'name': bank!.name,
      } : null,
    };
  }

}