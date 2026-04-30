import '../../../../core/service/address/Ward.dart';
import '../../../../core/service/address/provine_summary.dart';
import '../../../employee/data/mapper/employee_mapper.dart';
import '../../domain/entities/candidate.dart';
import '../models/candidate_dto.dart';

extension CandidateMapper on CandidateDto {
  Candidate toEntity() {
    return Candidate(
      id: id,
      name: fullName ?? 'NO NAME',
      email: email,
      phone: phone,
      avatar: avatar,
      dateOfBirth: dateOfBirth,
      gender: gender?.toGender(),
      address: address,
      maritalStatus: maritalStatus,
      nationality: nationality,
      religion: religion,
      identityCardNumber: identityCardNumber,
      identityCardIssueDate: identityCardIssueDate,
      frontIdentityCardImage: frontIdentityCardImage,
      backIdentityCardImage: backIdentityCardImage,
      cvUrl: cvUrl,

      province: province != null
          ? ProvinceSummary(
        maTinhBNV: province!.id,
        name: province!.name,
      )
          : null,

      ward: ward != null
          ? Ward(
        code: ward!.id,
        name: ward!.name,
      )
          : null,
    );
  }
}

extension CandidateDtoListMapper on List<CandidateDto> {
  List<Candidate> toEntityList() {
    return map((e) => e.toEntity()).toList();
  }
}