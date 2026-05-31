import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../attendance/presentation/widgets/attendance_month_selector.dart';
import '../../domain/entities/payroll.dart';
import '../providers/payroll_provider.dart';
import '../widgets/payroll_widgets.dart';

class MyBonusPenaltyScreen extends ConsumerWidget {
  const MyBonusPenaltyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final month = ref.watch(payrollMonthProvider);
    final itemsAsync = ref.watch(myBonusPenaltyListProvider(month));

    return Scaffold(
      backgroundColor: const Color(0xFFF3F3F3),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
        ),
        title: const Text(
          'Phiếu thưởng/phạt',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        titleSpacing: 0,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 12, 10, 0),
              child: AttendanceMonthSelector(
                month: month,
                onChanged: (value) =>
                    ref.read(payrollMonthProvider.notifier).setMonth(value),
              ),
            ),
            Expanded(
              child: itemsAsync.when(
                data: (items) =>
                    _BonusPenaltyContent(month: month, items: items),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, stackTrace) => _ErrorView(
                  message: error.toString(),
                  onRetry: () =>
                      ref.invalidate(myBonusPenaltyListProvider(month)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BonusPenaltyContent extends ConsumerWidget {
  final String month;
  final List<BonusPenalty> items;

  const _BonusPenaltyContent({required this.month, required this.items});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (items.isEmpty) {
      return RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(myBonusPenaltyListProvider(month));
          await ref.read(myBonusPenaltyListProvider(month).future);
        },
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: const [
            SizedBox(height: 160),
            Center(
              child: Text(
                'Chưa có phiếu thưởng/phạt trong tháng này',
                style: TextStyle(fontSize: 14, color: Color(0xFF7A7A7A)),
              ),
            ),
          ],
        ),
      );
    }

    final totalBonus = items
        .where((item) => item.isBonus && item.status == 'ACTIVE')
        .fold<double>(0, (total, item) => total + item.amount);
    final totalPenalty = items
        .where((item) => !item.isBonus && item.status == 'ACTIVE')
        .fold<double>(0, (total, item) => total + item.amount);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(myBonusPenaltyListProvider(month));
        await ref.read(myBonusPenaltyListProvider(month).future);
      },
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
        itemCount: items.length + 1,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          if (index == 0) {
            return Row(
              children: [
                Expanded(
                  child: _TotalCard(
                    label: 'Tổng thưởng',
                    value: formatMoney(totalBonus),
                    color: const Color(0xFF1F8F4D),
                    icon: Icons.add_circle_outline,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _TotalCard(
                    label: 'Tổng phạt',
                    value: formatMoney(totalPenalty),
                    color: const Color(0xFFB42318),
                    icon: Icons.remove_circle_outline,
                  ),
                ),
              ],
            );
          }
          return _BonusPenaltyCard(item: items[index - 1]);
        },
      ),
    );
  }
}

class _TotalCard extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  final IconData icon;

  const _TotalCard({
    required this.label,
    required this.value,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return PayrollInfoCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w900,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: Color(0xFF667085)),
          ),
        ],
      ),
    );
  }
}

class _BonusPenaltyCard extends StatelessWidget {
  final BonusPenalty item;

  const _BonusPenaltyCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final color = item.isBonus
        ? const Color(0xFF1F8F4D)
        : const Color(0xFFB42318);
    final title = item.isBonus ? 'Thưởng' : 'Phạt';

    return PayrollInfoCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: item.isBonus
                  ? const Color(0xFFEAF7EF)
                  : const Color(0xFFFFF0F0),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(item.isBonus ? Icons.add : Icons.remove, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        item.autoPolicyName ?? title,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF1A1A1A),
                        ),
                      ),
                    ),
                    _StatusChip(status: item.status),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  formatMoney(item.amount),
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                    color: color,
                  ),
                ),
                if (item.reason?.isNotEmpty == true) ...[
                  const SizedBox(height: 4),
                  Text(
                    item.reason!,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFF667085),
                    ),
                  ),
                ],
                const SizedBox(height: 4),
                Text(
                  '${item.source == 'AUTO' ? 'Tự động' : 'Thủ công'} • ${formatDate(item.month)}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF98A2B3),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String status;

  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    final active = status == 'ACTIVE';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: active ? const Color(0xFFEAF7EF) : const Color(0xFFF0F0F0),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        active ? 'Đang áp dụng' : 'Đã hủy',
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w800,
          color: active ? const Color(0xFF1F8F4D) : const Color(0xFF667085),
        ),
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
