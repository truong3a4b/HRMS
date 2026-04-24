import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/service/bank/bank_remote.dart';

import 'bank.dart';

class BankRepo {
  final BankRemote remote;

  BankRepo(this.remote);

  Future<List<Bank>> getBanks() async {
    await Future.delayed(const Duration(seconds: 1)); // Simulate network delay
    final banks = [
      Bank(id: '1', name: 'Vietcombank'),
      Bank(id: '2', name: 'Techcombank'),
      Bank(id: '3', name: 'BIDV'),
    ];
    return banks;
  }
}

final bankRepoProvider = Provider<BankRepo>((ref) {
  final remote = ref.watch(bankRemoteProvider);

  return BankRepo(remote);
});
