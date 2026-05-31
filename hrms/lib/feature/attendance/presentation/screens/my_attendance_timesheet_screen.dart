import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/attendance.dart';
import '../providers/attendance_provider.dart';
import '../widgets/attendance_month_selector.dart';
import '../widgets/attendance_status_badge.dart';
import '../widgets/attendance_utils.dart';

class MyAttendanceTimesheetScreen extends ConsumerWidget {
  const MyAttendanceTimesheetScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final month = ref.watch(attendanceMonthProvider);
    final timesheetAsync = ref.watch(myAttendanceTimesheetProvider(month));

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
          'Bảng công của tôi',
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
              child: timesheetAsync.when(
                data: (data) => _TimesheetContent(data: data),
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

class _TimesheetContent extends ConsumerStatefulWidget {
  final AttendanceTimesheetData data;

  const _TimesheetContent({required this.data});

  @override
  ConsumerState<_TimesheetContent> createState() => _TimesheetContentState();
}

class _TimesheetContentState extends ConsumerState<_TimesheetContent> {
  late DateTime _selectedDate;

  @override
  void initState() {
    super.initState();
    _selectedDate = _initialSelectedDate(widget.data);
  }

  @override
  void didUpdateWidget(covariant _TimesheetContent oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.data.month != widget.data.month ||
        _monthKey(_selectedDate) != widget.data.month) {
      _selectedDate = _initialSelectedDate(widget.data);
    }
  }

  @override
  Widget build(BuildContext context) {
    final dayByDate = {
      for (final day in widget.data.days) _dateKey(day.date): day,
    };
    final selectedDay = dayByDate[_dateKey(_selectedDate)];

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(myAttendanceTimesheetProvider(widget.data.month));
        await ref.read(myAttendanceTimesheetProvider(widget.data.month).future);
      },
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
        children: [
          _SummaryGrid(totals: widget.data.totals),
          const SizedBox(height: 12),
          _MonthCalendar(
            month: widget.data.month,
            dayByDate: dayByDate,
            selectedDate: _selectedDate,
            onSelect: (date) {
              setState(() {
                _selectedDate = date;
              });
            },
          ),
          const SizedBox(height: 14),
          _SelectedDaySection(selectedDate: _selectedDate, day: selectedDay),
        ],
      ),
    );
  }
}

class _SummaryGrid extends StatelessWidget {
  final AttendanceTimesheetTotals totals;

  const _SummaryGrid({required this.totals});

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 1.75,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        _SummaryCard(
          label: 'Công chuẩn',
          value: formatNumber(totals.standardWorkUnits),
          icon: Icons.calendar_today,
        ),
        _SummaryCard(
          label: 'Công thực tế',
          value: formatNumber(totals.actualWorkUnits),
          icon: Icons.access_time_filled,
        ),
        _SummaryCard(
          label: 'Tăng ca',
          value: formatNumber(totals.overtimeUnits),
          icon: Icons.timer,
        ),
        _SummaryCard(
          label: 'Muộn/về sớm',
          value: totals.lateEarlyCount.toString(),
          icon: Icons.warning_amber_rounded,
        ),
      ],
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _SummaryCard({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: const Color(0xFFEAF4FF),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: const Color(0xFF0069B4), size: 21),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
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
          ),
        ],
      ),
    );
  }
}

class _MonthCalendar extends StatelessWidget {
  final String month;
  final Map<String, AttendanceTimesheetDay> dayByDate;
  final DateTime selectedDate;
  final ValueChanged<DateTime> onSelect;

  const _MonthCalendar({
    required this.month,
    required this.dayByDate,
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
              final hasTimesheet =
                  dayByDate[_dateKey(cell.date)]?.recordDetails.isNotEmpty ==
                  true;

              return _CalendarDayCell(
                date: cell.date,
                inMonth: cell.inMonth,
                selected: _isSameDate(cell.date, selectedDate),
                isToday: _isSameDate(cell.date, DateTime.now()),
                hasTimesheet: hasTimesheet,
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
  final bool hasTimesheet;
  final VoidCallback onTap;

  const _CalendarDayCell({
    required this.date,
    required this.inMonth,
    required this.selected,
    required this.isToday,
    required this.hasTimesheet,
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
            width: hasTimesheet ? 5 : 0,
            height: hasTimesheet ? 5 : 0,
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

class _SelectedDaySection extends StatelessWidget {
  final DateTime selectedDate;
  final AttendanceTimesheetDay? day;

  const _SelectedDaySection({required this.selectedDate, required this.day});

  @override
  Widget build(BuildContext context) {
    final details = day?.recordDetails ?? const <AttendanceRecordDetail>[];

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
          const SizedBox(height: 8),
          if (day != null)
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _MetricChip(
                  label: 'Công',
                  value:
                      '${formatNumber(day!.actualWorkUnits)}/${formatNumber(day!.standardWorkUnits)}',
                ),
                _MetricChip(
                  label: 'Tăng ca',
                  value: formatNumber(day!.overtimeUnits),
                ),
                _MetricChip(label: 'Muộn', value: day!.lateCount.toString()),
                _MetricChip(
                  label: 'Về sớm',
                  value: day!.earlyLeaveCount.toString(),
                ),
              ],
            ),
          if (details.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(
                'Bạn không có bảng công ngày ${formatDate(selectedDate)}',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF4F4F4F),
                ),
              ),
            )
          else
            ...details.map((detail) {
              return Padding(
                padding: const EdgeInsets.only(top: 10),
                child: _ShiftDetailRow(detail: detail),
              );
            }),
        ],
      ),
    );
  }
}

class _MetricChip extends StatelessWidget {
  final String label;
  final String value;

  const _MetricChip({required this.label, required this.value});

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

class _ShiftDetailRow extends StatelessWidget {
  final AttendanceRecordDetail detail;

  const _ShiftDetailRow({required this.detail});

  @override
  Widget build(BuildContext context) {
    final title = detail.workShiftCode?.isNotEmpty == true
        ? '${detail.workShiftCode} - ${detail.workShiftName}'
        : detail.workShiftName;

    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFFAFAFA),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF2F2F2F),
                  ),
                ),
              ),
              AttendanceStatusBadge(status: detail.status),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'Ca: ${detail.shiftStartClock ?? '-'} - ${detail.shiftEndClock ?? '-'}',
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Color(0xFF7A7A7A),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Vào: ${formatTime(detail.checkInTime)} · Ra: ${formatTime(detail.checkOutTime)}',
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

DateTime _initialSelectedDate(AttendanceTimesheetData data) {
  final now = DateTime.now();
  if (_monthKey(now) == data.month) {
    return DateTime(now.year, now.month, now.day);
  }
  if (data.days.isNotEmpty) {
    final first = data.days.first.date;
    return DateTime(first.year, first.month, first.day);
  }
  final parts = data.month.split('-');
  final year = int.tryParse(parts.first) ?? now.year;
  final month = parts.length > 1
      ? int.tryParse(parts[1]) ?? now.month
      : now.month;
  return DateTime(year, month);
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
