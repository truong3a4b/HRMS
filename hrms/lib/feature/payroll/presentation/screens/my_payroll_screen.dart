import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../attendance/presentation/widgets/attendance_month_selector.dart';
import '../../domain/entities/payroll.dart';
import '../providers/payroll_provider.dart';
import '../widgets/payroll_widgets.dart';

class MyPayrollScreen extends ConsumerWidget {
  const MyPayrollScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final month = ref.watch(payrollMonthProvider);
    final payrollAsync = ref.watch(myPayrollListProvider(month));

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
          'Bảng lương của tôi',
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
              child: payrollAsync.when(
                data: (items) => _PayrollContent(month: month, items: items),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, stackTrace) => _ErrorView(
                  message: error.toString(),
                  onRetry: () => ref.invalidate(myPayrollListProvider(month)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PayrollContent extends ConsumerWidget {
  final String month;
  final List<PayrollSummary> items;

  const _PayrollContent({required this.month, required this.items});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (items.isEmpty) {
      return RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(myPayrollListProvider(month));
          await ref.read(myPayrollListProvider(month).future);
        },
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: const [
            SizedBox(height: 160),
            Center(
              child: Text(
                'Chưa có bảng lương trong tháng này',
                style: TextStyle(fontSize: 14, color: Color(0xFF7A7A7A)),
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(myPayrollListProvider(month));
        await ref.read(myPayrollListProvider(month).future);
      },
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
        itemCount: items.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final item = items[index];
          return _PayrollCard(
            payroll: item,
            onTap: () => _openDetail(context, item.id),
          );
        },
      ),
    );
  }

  void _openDetail(BuildContext context, String id) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useRootNavigator: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _PayrollDetailSheet(id: id),
    );
  }
}

class _PayrollCard extends StatelessWidget {
  final PayrollSummary payroll;
  final VoidCallback onTap;

  const _PayrollCard({required this.payroll, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: PayrollInfoCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Lương tháng ${payroll.month}/${payroll.year}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF1A1A1A),
                    ),
                  ),
                ),
                _StatusChip(status: payroll.status),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              formatMoney(payroll.netSalary),
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w900,
                color: Color(0xFF0069B4),
              ),
            ),
            const SizedBox(height: 10),
            PayrollMetricRow(
              label: 'Tổng thu nhập',
              value: formatMoney(payroll.grossSalary),
            ),
            PayrollMetricRow(
              label: 'Khấu trừ',
              value: formatMoney(payroll.totalDeduction),
              valueColor: const Color(0xFFB42318),
            ),
            PayrollMetricRow(
              label: 'Đã thanh toán',
              value: formatMoney(payroll.paidAmount),
              valueColor: const Color(0xFF1F8F4D),
            ),
          ],
        ),
      ),
    );
  }
}

class _PayrollDetailSheet extends ConsumerWidget {
  final String id;

  const _PayrollDetailSheet({required this.id});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailAsync = ref.watch(payrollDetailProvider(id));

    return SafeArea(
      child: FractionallySizedBox(
        heightFactor: 0.92,
        child: Container(
          decoration: const BoxDecoration(
            color: Color(0xFFF3F3F3),
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: detailAsync.when(
            data: (detail) => _PayrollDetailContent(detail: detail),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, stackTrace) => _ErrorView(
              message: error.toString(),
              onRetry: () => ref.invalidate(payrollDetailProvider(id)),
            ),
          ),
        ),
      ),
    );
  }
}

class _PayrollDetailContent extends StatelessWidget {
  final PayrollDetail detail;

  const _PayrollDetailContent({required this.detail});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.fromLTRB(16, 10, 8, 14),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  'Chi tiết lương ${detail.month}/${detail.year}',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(12),
            children: [
              PayrollInfoCard(
                child: Column(
                  children: [
                    PayrollMetricRow(
                      label: 'Lương cơ bản',
                      value: formatMoney(detail.baseSalary),
                    ),
                    PayrollMetricRow(
                      label: 'Ngày công thực tế',
                      value: _formatNumber(detail.actualWorkDays),
                    ),
                    PayrollMetricRow(
                      label: 'Tổng thu nhập',
                      value: formatMoney(detail.grossSalary),
                    ),
                    PayrollMetricRow(
                      label: 'Tổng khấu trừ',
                      value: formatMoney(detail.totalDeduction),
                      valueColor: const Color(0xFFB42318),
                    ),
                    const Divider(),
                    PayrollMetricRow(
                      label: 'Thực nhận',
                      value: formatMoney(detail.netSalary),
                      valueColor: const Color(0xFF0069B4),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              _LineSection(title: 'Phụ cấp', lines: detail.allowanceLines),
              const SizedBox(height: 12),
              _LineSection(title: 'Tăng ca', lines: detail.overtimeLines),
              const SizedBox(height: 12),
              _LineSection(
                title: 'Thưởng/phạt trong lương',
                lines: detail.bonusPenaltyLines,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _LineSection extends StatelessWidget {
  final String title;
  final List<PayrollLine> lines;

  const _LineSection({required this.title, required this.lines});

  @override
  Widget build(BuildContext context) {
    return PayrollInfoCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          if (lines.isEmpty)
            const Text(
              'Không có dữ liệu',
              style: TextStyle(fontSize: 13, color: Color(0xFF7A7A7A)),
            )
          else
            ...lines.map((line) {
              return PayrollMetricRow(
                label: line.note?.isNotEmpty == true
                    ? '${line.name} (${line.note})'
                    : line.name,
                value: formatMoney(line.amount),
                valueColor: line.isBonus
                    ? const Color(0xFF1F8F4D)
                    : const Color(0xFFB42318),
              );
            }),
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
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: const Color(0xFFEAF4FF),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        status.payrollStatusLabel,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: Color(0xFF0069B4),
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

String _formatNumber(double value) {
  if (value == value.roundToDouble()) return value.toInt().toString();
  return value
      .toStringAsFixed(2)
      .replaceFirst(RegExp(r'0+$'), '')
      .replaceFirst(RegExp(r'\.$'), '');
}
