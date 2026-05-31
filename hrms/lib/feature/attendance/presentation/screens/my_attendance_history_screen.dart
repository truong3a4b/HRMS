import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/attendance.dart';
import '../providers/attendance_provider.dart';
import '../widgets/attendance_month_selector.dart';
import '../widgets/attendance_utils.dart';

class MyAttendanceHistoryScreen extends ConsumerWidget {
  const MyAttendanceHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final month = ref.watch(attendanceMonthProvider);
    final historyAsync = ref.watch(myAttendanceHistoryProvider(month));

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
          'Lịch sử chấm công',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        titleSpacing: 0,
        centerTitle: false,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 12, 10, 0),
              child: AttendanceMonthSelector(
                month: month,
                onChanged: (value) =>
                    ref.read(attendanceMonthProvider.notifier).setMonth(value),
              ),
            ),
            Expanded(
              child: historyAsync.when(
                data: (data) => _HistoryContent(data: data),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, stackTrace) => _ErrorView(message: '$error'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HistoryContent extends ConsumerWidget {
  final AttendanceHistoryData data;

  const _HistoryContent({required this.data});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (data.logs.isEmpty) {
      return const Center(
        child: Text(
          'Chưa có dữ liệu chấm công trong tháng này',
          style: TextStyle(fontSize: 14, color: Color(0xFF7A7A7A)),
          textAlign: TextAlign.center,
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(myAttendanceHistoryProvider(data.month));
        await ref.read(myAttendanceHistoryProvider(data.month).future);
      },
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
        itemCount: data.logs.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          return _AttendanceLogCard(log: data.logs[index]);
        },
      ),
    );
  }
}

class _AttendanceLogCard extends StatelessWidget {
  final AttendanceLog log;

  const _AttendanceLogCard({required this.log});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: const Color(0xFFE6EEF2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.fingerprint,
              color: Color(0xFF0069B4),
              size: 28,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  formatDateTime(log.timestamp),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF1A1A1A),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  '${log.device.name} (${log.device.code})',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF0069B4),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Finger ID: ${log.fingerId} · Ghi nhận: ${formatDateTime(log.createdAt)}',
                  style: const TextStyle(
                    fontSize: 12,
                    height: 1.4,
                    color: Color(0xFF7A7A7A),
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

class _ErrorView extends StatelessWidget {
  final String message;

  const _ErrorView({required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Text(
          message,
          style: const TextStyle(color: Colors.red, fontSize: 14),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}
