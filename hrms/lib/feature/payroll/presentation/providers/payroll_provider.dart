import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/repo/payroll_repository.dart';
import '../../domain/entities/payroll.dart';

String currentPayrollMonthKey() {
  final now = DateTime.now();
  return '${now.year}-${now.month.toString().padLeft(2, '0')}';
}

final payrollMonthProvider = NotifierProvider<PayrollMonthNotifier, String>(
  PayrollMonthNotifier.new,
);

class PayrollMonthNotifier extends Notifier<String> {
  @override
  String build() => currentPayrollMonthKey();

  void setMonth(String month) {
    state = month;
  }
}

final holidayListProvider = FutureProvider.autoDispose
    .family<List<Holiday>, String>((ref, month) {
      final (year, monthNumber) = _parseMonth(month);
      return ref
          .read(payrollRepositoryProvider)
          .getHolidays(month: monthNumber, year: year);
    });

final myPayrollListProvider = FutureProvider.autoDispose
    .family<List<PayrollSummary>, String>((ref, month) {
      final (year, monthNumber) = _parseMonth(month);
      return ref
          .read(payrollRepositoryProvider)
          .getMyPayrolls(month: monthNumber, year: year);
    });

final payrollDetailProvider = FutureProvider.autoDispose
    .family<PayrollDetail, String>((ref, id) {
      return ref.read(payrollRepositoryProvider).getPayrollById(id);
    });

final myBonusPenaltyListProvider = FutureProvider.autoDispose
    .family<List<BonusPenalty>, String>((ref, month) {
      return ref
          .read(payrollRepositoryProvider)
          .getMyBonusPenalties(month: month);
    });

(int, int) _parseMonth(String value) {
  final parts = value.split('-');
  final now = DateTime.now();
  final year = parts.isNotEmpty ? int.tryParse(parts[0]) ?? now.year : now.year;
  final month = parts.length > 1
      ? int.tryParse(parts[1]) ?? now.month
      : now.month;
  return (year, month);
}
