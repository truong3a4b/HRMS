import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/payroll.dart';
import '../datasources/payroll_remote.dart';
import '../mapper/payroll_mapper.dart';

class PayrollRepository {
  final PayrollRemote remote;

  PayrollRepository(this.remote);

  Future<List<Holiday>> getHolidays({
    required int month,
    required int year,
  }) async {
    final dtos = await remote.getHolidays(month: month, year: year);
    return dtos.map((dto) => dto.toEntity()).toList();
  }

  Future<List<PayrollSummary>> getMyPayrolls({
    required int month,
    required int year,
  }) async {
    final dtos = await remote.getMyPayrolls(month: month, year: year);
    return dtos.map((dto) => dto.toEntity()).toList();
  }

  Future<PayrollDetail> getPayrollById(String id) async {
    final dto = await remote.getPayrollById(id);
    return dto.toEntity();
  }

  Future<List<BonusPenalty>> getMyBonusPenalties({
    required String month,
    String? status,
  }) async {
    final dtos = await remote.getMyBonusPenalties(month: month, status: status);
    return dtos.map((dto) => dto.toEntity()).toList();
  }
}

final payrollRepositoryProvider = Provider<PayrollRepository>((ref) {
  final remote = ref.watch(payrollRemoteProvider);
  return PayrollRepository(remote);
});
