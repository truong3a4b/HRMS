import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../attendance/presentation/widgets/attendance_month_selector.dart';
import '../../domain/entities/payroll.dart';
import '../providers/payroll_provider.dart';
import '../widgets/payroll_widgets.dart';

class HolidayListScreen extends ConsumerWidget {
  const HolidayListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final month = ref.watch(payrollMonthProvider);
    final holidaysAsync = ref.watch(holidayListProvider(month));

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
          'Ngày nghỉ lễ',
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
              child: holidaysAsync.when(
                data: (items) => _HolidayContent(month: month, items: items),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, stackTrace) => _ErrorView(
                  message: error.toString(),
                  onRetry: () => ref.invalidate(holidayListProvider(month)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HolidayContent extends ConsumerWidget {
  final String month;
  final List<Holiday> items;

  const _HolidayContent({required this.month, required this.items});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (items.isEmpty) {
      return RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(holidayListProvider(month));
          await ref.read(holidayListProvider(month).future);
        },
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: const [
            SizedBox(height: 160),
            Center(
              child: Text(
                'Không có ngày nghỉ lễ trong tháng này',
                style: TextStyle(fontSize: 14, color: Color(0xFF7A7A7A)),
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(holidayListProvider(month));
        await ref.read(holidayListProvider(month).future);
      },
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
        itemCount: items.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) => _HolidayCard(holiday: items[index]),
      ),
    );
  }
}

class _HolidayCard extends StatelessWidget {
  final Holiday holiday;

  const _HolidayCard({required this.holiday});

  @override
  Widget build(BuildContext context) {
    return PayrollInfoCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFFEAF4FF),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.event_available, color: Color(0xFF0069B4)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  holiday.name,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF1A1A1A),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  formatDate(holiday.date),
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF0069B4),
                  ),
                ),
                if (holiday.description?.isNotEmpty == true) ...[
                  const SizedBox(height: 4),
                  Text(
                    holiday.description!,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFF667085),
                    ),
                  ),
                ],
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF7E6),
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text(
              'x${_formatNumber(holiday.salaryMultiplier)}',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                color: Color(0xFFB26A00),
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

String _formatNumber(double value) {
  if (value == value.roundToDouble()) return value.toInt().toString();
  return value
      .toStringAsFixed(2)
      .replaceFirst(RegExp(r'0+$'), '')
      .replaceFirst(RegExp(r'\.$'), '');
}
