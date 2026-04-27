import 'package:hrms/core/service/address/Ward.dart';
import 'package:hrms/core/service/address/provine_summary.dart';

import '../../../../core/service/bank/bank.dart';

class AddEmployeeRequest {
  final String name;
  final String email;
  final String? phone;
  final String? positionId;
  final String? avatar;
  final String? departmentId;
  final DateTime? dateOfBirth;
  final String? gender;
  final String? address;
  final ProvinceSummary? province;
  final Ward? ward;
  final DateTime? hireDate;
  final double? salary;
  final String? bankAccount;
  final Bank? bank;

  AddEmployeeRequest({
    required this.name,
    required this.email,
    this.phone,
    this.positionId,
    this.avatar,
    this.departmentId,
    this.dateOfBirth,
    this.gender,
    this.address,
    this.province,
    this.ward,
    this.hireDate,
    this.salary,
    this.bankAccount,
    this.bank,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'phone': phone,
      'positionId': positionId,
      'avatar': avatar,
      'departmentId': departmentId,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'gender': gender,
      'address': address,
      'province': province != null
          ? {'id': province!.maTinhBNV, 'name': province!.name}
          : null,
      'ward': ward != null ? {'id': ward!.code, 'name': ward!.name} : null,
      'hireDate': hireDate?.toIso8601String(),
      'salary': salary,
      'bankAccount': bankAccount,
      'bank': bank != null ? {'id': bank!.id, 'name': bank!.name} : null,
    };
  }
}
