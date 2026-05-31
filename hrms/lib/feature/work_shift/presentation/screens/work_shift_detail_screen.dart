import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/work_shift.dart';
import '../providers/work_shift_provider.dart';

class WorkShiftDetailScreen extends ConsumerWidget {
  final String shiftId;

  const WorkShiftDetailScreen({super.key, required this.shiftId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final shiftAsync = ref.watch(workShiftDetailProvider(shiftId));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF3F8FB),
        elevation: 0,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
        ),
      ),
      body: shiftAsync.when(
        data: (shift) => _WorkShiftDetailContent(shift: shift),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stackTrace) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Text(
                error.toString(),
                style: const TextStyle(color: Colors.red, fontSize: 14),
                textAlign: TextAlign.center,
              ),
            ),
          );
        },
      ),
    );
  }
}

class _WorkShiftDetailContent extends StatelessWidget {
  final WorkShift shift;

  const _WorkShiftDetailContent({required this.shift});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _Header(shift: shift),
            const SizedBox(height: 16),
            _SectionCard(
              title: 'Thông tin ca',
              children: [
                _InfoRow(label: 'Mã ca', value: shift.code),
                _InfoRow(label: 'Tên ca', value: shift.name),
                _InfoRow(
                  label: 'Trạng thái',
                  value: shift.isActive ? 'Đang áp dụng' : 'Tạm dừng',
                ),
                _InfoRow(
                  label: 'Loại ca',
                  value: shift.isOvertime ? 'Ca tăng ca' : 'Ca làm việc',
                ),
                _InfoRow(
                  label: 'Qua đêm',
                  value: shift.isOvernight ? 'Có' : 'Không',
                ),
                _InfoRow(
                  label: 'Số công',
                  value: _formatNumber(shift.workUnits),
                ),
                if (shift.isOvertime)
                  _InfoRow(
                    label: 'Hệ số tăng ca',
                    value: 'x${_formatNumber(shift.overtimeMultiplier)}',
                  ),
              ],
            ),
            const SizedBox(height: 16),
            _SectionCard(
              title: 'Khung giờ làm việc',
              children: [
                _InfoRow(label: 'Giờ bắt đầu', value: shift.startTime),
                _InfoRow(label: 'Giờ kết thúc', value: shift.endTime),
                _InfoRow(
                  label: 'Bắt đầu nghỉ giữa ca',
                  value: shift.breakStartTime ?? '-',
                ),
                _InfoRow(
                  label: 'Kết thúc nghỉ giữa ca',
                  value: shift.breakEndTime ?? '-',
                ),
              ],
            ),
            const SizedBox(height: 16),
            _SectionCard(
              title: 'Chấm công',
              children: [
                _InfoRow(
                  label: 'Khung check-in',
                  value: '${shift.checkInStartTime} - ${shift.checkInEndTime}',
                ),
                _InfoRow(
                  label: 'Khung check-out',
                  value:
                      '${shift.checkOutStartTime} - ${shift.checkOutEndTime}',
                ),
                _InfoRow(
                  label: 'Cho phép đi muộn',
                  value: '${shift.lateGracePeriod} phút',
                ),
                _InfoRow(
                  label: 'Cho phép về sớm',
                  value: '${shift.earlyLeaveGracePeriod} phút',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  final WorkShift shift;

  const _Header({required this.shift});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(0, 8, 0, 10),
      decoration: const BoxDecoration(color: Color(0xFFF3F8FB)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            shift.name,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: Color(0xFF2F2F2F),
              height: 1.2,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '${shift.startTime} - ${shift.endTime}',
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: Color(0xFF0069B4),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _SectionCard({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: Color(0xFF2F2F2F),
            ),
          ),
          const SizedBox(height: 10),
          ...children,
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 4,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF7A7A7A),
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 5,
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF2F2F2F),
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

String _formatNumber(double value) {
  if (value == value.roundToDouble()) {
    return value.toInt().toString();
  }
  return value
      .toStringAsFixed(2)
      .replaceFirst(RegExp(r'0+$'), '')
      .replaceFirst(RegExp(r'\.$'), '');
}
