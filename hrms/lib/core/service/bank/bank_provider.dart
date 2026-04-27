import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'bank.dart';
import 'bank_repo.dart';

final bankProvider = FutureProvider<List<Bank>>((ref) async {
  final bankRepo = ref.read(bankRepoProvider);
  return await bankRepo.getBanks();
});