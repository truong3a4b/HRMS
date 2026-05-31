import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../domain/entities/work_shift.dart';
import '../providers/work_shift_provider.dart';

class WorkShiftListScreen extends ConsumerWidget {
  const WorkShiftListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final shiftsAsync = ref.watch(workShiftListProvider);

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
          'Danh sách ca làm việc',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        titleSpacing: 0,
        centerTitle: false,
      ),
      body: shiftsAsync.when(
        data: (shifts) {
          if (shifts.isEmpty) {
            return const Center(
              child: Text(
                'Chưa có ca làm việc nào',
                style: TextStyle(fontSize: 14, color: Color(0xFF7A7A7A)),
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(workShiftListProvider);
              await ref.read(workShiftListProvider.future);
            },
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
              itemCount: shifts.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final shift = shifts[index];
                return WorkShiftCard(shift: shift);
              },
            ),
          );
        },
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

class WorkShiftCard extends StatelessWidget {
  final WorkShift shift;

  const WorkShiftCard({super.key, required this.shift});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => context.push('/work-shift-detail/${shift.id}'),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        shift.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF1A1A1A),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        shift.code,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF0069B4),
                        ),
                      ),
                    ],
                  ),
                ),
                _StatusBadge(isActive: shift.isActive),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(
                  Icons.access_time,
                  size: 18,
                  color: Color(0xFF7A7A7A),
                ),
                const SizedBox(width: 6),
                Text(
                  '${shift.startTime} - ${shift.endTime}',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF333333),
                  ),
                ),
                if (shift.isOvernight) ...[
                  const SizedBox(width: 8),
                  const _TypeChip(label: 'Qua đêm'),
                ],
              ],
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _InfoChip(label: 'Công', value: _formatNumber(shift.workUnits)),
                _InfoChip(
                  label: 'Check-in',
                  value: '${shift.checkInStartTime} - ${shift.checkInEndTime}',
                ),
                if (shift.isOvertime)
                  _InfoChip(
                    label: 'Tăng ca',
                    value: 'x${_formatNumber(shift.overtimeMultiplier)}',
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final bool isActive;

  const _StatusBadge({required this.isActive});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: isActive ? const Color(0xFFEAF7EF) : const Color(0xFFF0F0F0),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        isActive ? 'Đang dùng' : 'Tạm dừng',
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: isActive ? const Color(0xFF1F8F4D) : const Color(0xFF7A7A7A),
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final String label;
  final String value;

  const _InfoChip({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: const Color(0xFFF4F8FB),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        '$label: $value',
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: Color(0xFF4F4F4F),
        ),
      ),
    );
  }
}

class _TypeChip extends StatelessWidget {
  final String label;

  const _TypeChip({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF3E0),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: Color(0xFFB26A00),
        ),
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
