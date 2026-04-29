import '../../domain/entities/candidate.dart';
import '../models/candidate_dto.dart';

extension CandidateMapper on CandidateDto {
  Candidate toEntity() {
    return Candidate(
      id: id,
      name: fullName ?? "NO NAME",
      email: email,
      phone: phone,
      avatar: avatar,
      dateOfBirth: dateOfBirth,
      address: address,
      cvUrl: cvUrl,
    );
  }
}

extension CandidateDtoListMapper on List<CandidateDto> {
  List<Candidate> toEntityList() {
    return map((e) => e.toEntity()).toList();
  }
}