  import 'profile.dart';

  class Candidate extends Profile {
    final String? cvUrl;

    const Candidate({
      required super.id,
      required super.name,
      required super.email,
      super.phone,
      super.avatar,
      super.dateOfBirth,
      super.gender,
      super.address,
      super.province,
      super.ward,
      super.maritalStatus,
      super.nationality,
      super.religion,
      super.identityCardNumber,
      super.identityCardIssueDate,
      super.frontIdentityCardImage,
      super.backIdentityCardImage,
      this.cvUrl,
    });
  }