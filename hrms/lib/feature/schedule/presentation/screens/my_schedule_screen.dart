import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../attendance/presentation/widgets/attendance_month_selector.dart';
import '../../../attendance/presentation/widgets/attendance_utils.dart';
import '../../domain/entities/work_schedule.dart';
import '../providers/schedule_provider.dart';

class MyScheduleScreen extends ConsumerWidget {
  const MyScheduleScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final month = ref.watch(scheduleMonthProvider);
    final scheduleAsync = ref.watch(myScheduleProvider(month));

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
          'Lịch làm việc của tôi',
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
                    ref.read(scheduleMonthProvider.notifier).setMonth(value),
              ),
            ),
            Expanded(
              child: scheduleAsync.when(
                data: (items) => _ScheduleContent(month: month, items: items),
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

class _ScheduleContent extends ConsumerStatefulWidget {
  final String month;
  final List<WorkSchedule> items;

  const _ScheduleContent({required this.month, required this.items});

  @override
  ConsumerState<_ScheduleContent> createState() => _ScheduleContentState();
}

class _ScheduleContentState extends ConsumerState<_ScheduleContent> {
  late DateTime _selectedDate;

  @override
  void initState() {
    super.initState();
    _selectedDate = _initialSelectedDate(widget.month, widget.items);
  }

  @override
  void didUpdateWidget(covariant _ScheduleContent oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.month != widget.month ||
        _monthKey(_selectedDate) != widget.month) {
      _selectedDate = _initialSelectedDate(widget.month, widget.items);
    }
  }

  @override
  Widget build(BuildContext context) {
    final scheduleByDate = {
      for (final item in widget.items) _dateKey(item.date): item,
    };
    final selectedSchedule = scheduleByDate[_dateKey(_selectedDate)];

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(myScheduleProvider(widget.month));
        await ref.read(myScheduleProvider(widget.month).future);
      },
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
        children: [
          _ScheduleStats(items: widget.items),
          const SizedBox(height: 12),
          _ScheduleCalendar(
            month: widget.month,
            scheduleByDate: scheduleByDate,
            selectedDate: _selectedDate,
            onSelect: (date) {
              setState(() {
                _selectedDate = date;
              });
            },
          ),
          const SizedBox(height: 14),
          _SelectedScheduleSection(
            selectedDate: _selectedDate,
            schedule: selectedSchedule,
          ),
        ],
      ),
    );
  }
}

class _ScheduleStats extends StatelessWidget {
  final List<WorkSchedule> items;

  const _ScheduleStats({required this.items});

  @override
  Widget build(BuildContext context) {
    final workingDays = items
        .where((item) => item.workShifts.isNotEmpty)
        .length;
    final shifts = items.fold<int>(
      0,
      (total, item) => total + item.workShifts.length,
    );
    final overtimeShifts = items.fold<int>(
      0,
      (total, item) =>
          total + item.workShifts.where((shift) => shift.isOvertime).length,
    );

    return Row(
      children: [
        Expanded(
          child: _StatCard(
            label: 'Ngày làm',
            value: workingDays.toString(),
            icon: Icons.calendar_today,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _StatCard(
            label: 'Số ca',
            value: shifts.toString(),
            icon: Icons.access_time_filled,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _StatCard(
            label: 'Tăng ca',
            value: overtimeShifts.toString(),
            icon: Icons.timer,
          ),
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: const Color(0xFF0069B4), size: 22),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: Color(0xFF1A1A1A),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Color(0xFF7A7A7A),
            ),
          ),
        ],
      ),
    );
  }
}

class _ScheduleCalendar extends StatelessWidget {
  final String month;
  final Map<String, WorkSchedule> scheduleByDate;
  final DateTime selectedDate;
  final ValueChanged<DateTime> onSelect;

  const _ScheduleCalendar({
    required this.month,
    required this.scheduleByDate,
    required this.selectedDate,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final cells = _buildCalendarCells(month);

    return Container(
      padding: const EdgeInsets.fromLTRB(12, 14, 12, 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        children: [
          const Row(
            children: [
              _WeekDayLabel(label: 'T2'),
              _WeekDayLabel(label: 'T3'),
              _WeekDayLabel(label: 'T4'),
              _WeekDayLabel(label: 'T5'),
              _WeekDayLabel(label: 'T6'),
              _WeekDayLabel(label: 'T7'),
              _WeekDayLabel(label: 'CN', isSunday: true),
            ],
          ),
          const SizedBox(height: 8),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: cells.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              mainAxisSpacing: 8,
              crossAxisSpacing: 4,
              childAspectRatio: 0.92,
            ),
            itemBuilder: (context, index) {
              final cell = cells[index];
              final hasSchedule =
                  scheduleByDate[_dateKey(cell.date)]?.workShifts.isNotEmpty ==
                  true;

              return _CalendarDayCell(
                date: cell.date,
                inMonth: cell.inMonth,
                selected: _isSameDate(cell.date, selectedDate),
                isToday: _isSameDate(cell.date, DateTime.now()),
                hasMarker: hasSchedule,
                onTap: () => onSelect(cell.date),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _WeekDayLabel extends StatelessWidget {
  final String label;
  final bool isSunday;

  const _WeekDayLabel({required this.label, this.isSunday = false});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Center(
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w800,
            color: isSunday ? const Color(0xFFB42318) : const Color(0xFF2F2F2F),
          ),
        ),
      ),
    );
  }
}

class _CalendarDayCell extends StatelessWidget {
  final DateTime date;
  final bool inMonth;
  final bool selected;
  final bool isToday;
  final bool hasMarker;
  final VoidCallback onTap;

  const _CalendarDayCell({
    required this.date,
    required this.inMonth,
    required this.selected,
    required this.isToday,
    required this.hasMarker,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = selected
        ? Colors.white
        : inMonth
        ? const Color(0xFF606A76)
        : const Color(0xFFB9B9B9);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 36,
            height: 36,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: selected ? const Color(0xFF0069B4) : Colors.transparent,
              shape: BoxShape.circle,
              border: !selected && isToday
                  ? Border.all(color: const Color(0xFF0069B4), width: 1.4)
                  : null,
            ),
            child: Text(
              date.day.toString().padLeft(2, '0'),
              style: TextStyle(
                fontSize: 15,
                fontWeight: selected || isToday
                    ? FontWeight.w800
                    : FontWeight.w500,
                color: !selected && isToday ? const Color(0xFF0069B4) : color,
              ),
            ),
          ),
          const SizedBox(height: 3),
          AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            width: hasMarker ? 5 : 0,
            height: hasMarker ? 5 : 0,
            decoration: BoxDecoration(
              color: selected
                  ? const Color(0xFF0069B4)
                  : const Color(0xFF1F8F4D),
              shape: BoxShape.circle,
            ),
          ),
        ],
      ),
    );
  }
}

class _SelectedScheduleSection extends StatelessWidget {
  final DateTime selectedDate;
  final WorkSchedule? schedule;

  const _SelectedScheduleSection({
    required this.selectedDate,
    required this.schedule,
  });

  @override
  Widget build(BuildContext context) {
    final shifts = schedule?.workShifts ?? const <ScheduleShift>[];

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Ngày ${formatDate(selectedDate)}',
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w900,
              color: Color(0xFF1A1A1A),
            ),
          ),
          if (shifts.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(
                'Bạn không có lịch làm việc ngày ${formatDate(selectedDate)}',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF4F4F4F),
                ),
              ),
            )
          else
            ...shifts.map((shift) {
              return Padding(
                padding: const EdgeInsets.only(top: 10),
                child: _ScheduleShiftCard(shift: shift),
              );
            }),
        ],
      ),
    );
  }
}

class _ScheduleShiftCard extends StatelessWidget {
  final ScheduleShift shift;

  const _ScheduleShiftCard({required this.shift});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFFAFAFA),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: const Color(0xFFEAF4FF),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.access_time,
              color: Color(0xFF0069B4),
              size: 22,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  shift.code.isNotEmpty
                      ? '${shift.code} - ${shift.name}'
                      : shift.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF2F2F2F),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${shift.startTime} - ${shift.endTime}',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF7A7A7A),
                  ),
                ),
              ],
            ),
          ),
          if (shift.isOvertime)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF3E0),
                borderRadius: BorderRadius.circular(999),
              ),
              child: const Text(
                'Tăng ca',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
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

class _CalendarCell {
  final DateTime date;
  final bool inMonth;

  const _CalendarCell({required this.date, required this.inMonth});
}

List<_CalendarCell> _buildCalendarCells(String month) {
  final parts = month.split('-');
  final year = int.tryParse(parts.first) ?? DateTime.now().year;
  final monthNumber = parts.length > 1
      ? int.tryParse(parts[1]) ?? DateTime.now().month
      : DateTime.now().month;
  final firstDay = DateTime(year, monthNumber);
  final leadingDays = firstDay.weekday - 1;
  final start = firstDay.subtract(Duration(days: leadingDays));
  final lastDay = DateTime(year, monthNumber + 1, 0);
  final visibleDays = leadingDays + lastDay.day;
  final totalCells = visibleDays <= 35 ? 35 : 42;

  return List.generate(totalCells, (index) {
    final date = start.add(Duration(days: index));
    return _CalendarCell(date: date, inMonth: date.month == monthNumber);
  });
}

DateTime _initialSelectedDate(String month, List<WorkSchedule> items) {
  final now = DateTime.now();
  if (_monthKey(now) == month) {
    return DateTime(now.year, now.month, now.day);
  }
  if (items.isNotEmpty) {
    final first = items.first.date;
    return DateTime(first.year, first.month, first.day);
  }
  final parts = month.split('-');
  final year = int.tryParse(parts.first) ?? now.year;
  final monthNumber = parts.length > 1
      ? int.tryParse(parts[1]) ?? now.month
      : now.month;
  return DateTime(year, monthNumber);
}

String _monthKey(DateTime date) {
  return '${date.year}-${date.month.toString().padLeft(2, '0')}';
}

String _dateKey(DateTime date) {
  return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
}

bool _isSameDate(DateTime first, DateTime second) {
  return first.year == second.year &&
      first.month == second.month &&
      first.day == second.day;
}
