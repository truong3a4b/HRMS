import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/feature/candidate/data/datasources/candidate_remote.dart';
import 'package:hrms/feature/candidate/domain/entities/candidate.dart';

import '../mapper/candidate_mapper.dart';

class CandidateRepo {
  final CandidateRemote remote;

  CandidateRepo(this.remote);

  Future<Candidate> getCandidateDetail(String candidateId) async {
    try {
      final candidateDto = await remote.fetchCandidateById(candidateId);
      return candidateDto.toEntity();
    } catch (e) {
      rethrow;
    }
  }
}

final candidateRepoProvider = Provider((ref) {
  final remote = ref.watch(candidateRemoteProvider);
  return CandidateRepo(remote);
});
