
import 'package:hrms/core/service/address/Ward.dart';

class Province {
  final String maTinhBNV;
  final String maTinhTMS;
  final String name;
  final List<Ward> wards;

  Province({
    required this.maTinhBNV,
    required this.maTinhTMS,
    required this.name,
    required this.wards,
  });


  factory Province.fromJson(Map<String, dynamic> json) {
    return Province(
      maTinhBNV: json['matinhBNV'].toString(),
      maTinhTMS: json['matinhTMS'],
      name: json['tentinhmoi'],
      wards: (json['phuongxa'] as List)
          .map((e) => Ward.fromJson(e))
          .toList(),
    );
  }
}