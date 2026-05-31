import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/currency_convert.dart';
import '../../../../core/utils/time_convert.dart';
import '../../../employee/domain/entities/employee.dart';
import '../../../employee/domain/entities/employee_extra.dart';
import '../../../employee/presentation/providers/employee_extra_provider.dart';

class EmployeeJobHistoryTab extends ConsumerWidget {
  final Employee employee;
  final bool isMine;

  const EmployeeJobHistoryTab({
    super.key,
    required this.employee,
    required this.isMine,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final query = EmployeeExtraQuery(employeeId: employee.id, isMine: isMine);
    final historyAsync = ref.watch(employeeJobHistoryProvider(query));

    return historyAsync.when(
      data: (items) => _HistoryContent(items: items),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stackTrace) => _ErrorView(
        message: error.toString(),
        onRetry: () => ref.invalidate(employeeJobHistoryProvider(query)),
      ),
    );
  }
}

class _HistoryContent extends StatelessWidget {
  final List<EmployeeJobHistory> items;

  const _HistoryContent({required this.items});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const Center(
        child: Text(
          'Chưa có lịch sử thay đổi công việc',
          style: TextStyle(fontSize: 14, color: Color(0xFF7A7A7A)),
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      itemCount: items.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) => _HistoryCard(history: items[index]),
    );
  }
}

class _HistoryCard extends StatelessWidget {
  final EmployeeJobHistory history;

  const _HistoryCard({required this.history});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE8E8E8)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: const Color(0xFFEAF4FF),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.work_history_outlined,
              color: Color(0xFF0E67B2),
              size: 21,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  history.positionName ?? '-',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF1A1A1A),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  history.departmentName ?? '-',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF0E67B2),
                  ),
                ),
                const SizedBox(height: 8),
                _HistoryMeta(
                  label: 'Hiệu lực',
                  value:
                      '${TimeConvert.convertDateTimeToString(history.effectiveFrom)} - ${history.effectiveTo == null ? 'Hiện tại' : TimeConvert.convertDateTimeToString(history.effectiveTo)}',
                ),
                _HistoryMeta(
                  label: 'Ngày vào làm',
                  value: TimeConvert.convertDateTimeToString(history.hireDate),
                ),
                _HistoryMeta(
                  label: 'Lương',
                  value: CurrencyConvert.convertToCurrency(history.salary),
                ),
                _HistoryMeta(
                  label: 'Trạng thái',
                  value: history.status.employeeStatusLabel,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _HistoryMeta extends StatelessWidget {
  final String label;
  final String value;

  const _HistoryMeta({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 3),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 82,
            child: Text(
              label,
              style: const TextStyle(fontSize: 12, color: Color(0xFF7A7A7A)),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: Color(0xFF333333),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              message,
              style: const TextStyle(color: Colors.red, fontSize: 14),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Tải lại'),
            ),
          ],
        ),
      ),
    );
  }
}
