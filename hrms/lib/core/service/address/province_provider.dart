import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'Province.dart';
import 'address_repo.dart';

final provinceProvider = FutureProvider<List<Province>>((ref) async {
  final provinceRepo = ref.watch(addressRepoProvider);
  return await provinceRepo.getProvinces();
});