class BasicInfoRequest {
  final String id;
  final String? name;
  final String? phone;
  final String? avatar;
  final DateTime? dateOfBirth;
  final String? gender;
  final String? address;
  final int? provinceId;
  final int? wardId;
  final String? bankAccount;
  final String? bankName;

  BasicInfoRequest({
    required this.id,
    this.name,
    this.phone,
    this.avatar,
    this.dateOfBirth,
    this.gender,
    this.address,
    this.provinceId,
    this.wardId,
    this.bankAccount,
    this.bankName,
  });

}