import 'package:flutter/material.dart';

String formatMonthTitle(String month) {
  final parts = month.split('-');
  if (parts.length != 2) return month;
  return 'Tháng ${int.tryParse(parts[1]) ?? parts[1]}/${parts[0]}';
}

String formatDate(DateTime date) {
  return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
}

String formatDateTime(DateTime date) {
  return '${formatDate(date)} ${formatTime(date)}';
}

String formatTime(DateTime? date) {
  if (date == null) return '-';
  return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
}

String formatNumber(double value) {
  if (value == value.roundToDouble()) return value.toInt().toString();
  return value
      .toStringAsFixed(2)
      .replaceFirst(RegExp(r'0+$'), '')
      .replaceFirst(RegExp(r'\.$'), '');
}

String attendanceStatusLabel(String status) {
  switch (status) {
    case 'PRESENT':
      return 'Đủ công';
    case 'LATE':
      return 'Đi muộn';
    case 'EARLY_LEAVE':
      return 'Về sớm';
    case 'LATE_AND_EARLY_LEAVE':
      return 'Muộn/về sớm';
    case 'ABSENT':
      return 'Vắng';
    case 'ON_LEAVE':
      return 'Nghỉ';
    case 'PAID_LEAVE':
      return 'Nghỉ phép';
    case 'UNPAID_LEAVE':
      return 'Nghỉ không lương';
    default:
      return status;
  }
}

Color attendanceStatusColor(String status) {
  switch (status) {
    case 'PRESENT':
      return const Color(0xFF1F8F4D);
    case 'LATE':
    case 'EARLY_LEAVE':
    case 'LATE_AND_EARLY_LEAVE':
      return const Color(0xFFB26A00);
    case 'ABSENT':
      return const Color(0xFFB42318);
    case 'ON_LEAVE':
    case 'PAID_LEAVE':
    case 'UNPAID_LEAVE':
      return const Color(0xFF0069B4);
    default:
      return const Color(0xFF7A7A7A);
  }
}

Color attendanceStatusBackground(String status) {
  switch (status) {
    case 'PRESENT':
      return const Color(0xFFEAF7EF);
    case 'LATE':
    case 'EARLY_LEAVE':
    case 'LATE_AND_EARLY_LEAVE':
      return const Color(0xFFFFF3E0);
    case 'ABSENT':
      return const Color(0xFFFFEAEA);
    case 'ON_LEAVE':
    case 'PAID_LEAVE':
    case 'UNPAID_LEAVE':
      return const Color(0xFFEAF4FF);
    default:
      return const Color(0xFFF0F0F0);
  }
}
