import 'package:flutter/material.dart';

class DatePickerField extends StatefulWidget {
  final TextEditingController controller;
  final String hintText;
  final DateTime? firstDate;
  final DateTime? lastDate;
  final bool includeTime;
  final ValueChanged<DateTime?>? onDateSelected;

  const DatePickerField({
    super.key,
    required this.controller,
    required this.hintText,
    this.firstDate,
    this.lastDate,
    this.includeTime = false,
    this.onDateSelected,
  });

  @override
  State<DatePickerField> createState() => _DatePickerFieldState();
}

class _DatePickerFieldState extends State<DatePickerField> {
  final FocusNode _focusNode = FocusNode();
  bool isFocused = false;

  @override
  void initState() {
    super.initState();

    _focusNode.addListener(() {
      setState(() {
        isFocused = _focusNode.hasFocus;
      });
    });
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    _focusNode.requestFocus();

    final now = DateTime.now();
    final currentDate = _parseDate(widget.controller.text);

    final pickedDate = await showDatePicker(
      context: context,
      initialDate: currentDate ?? now,
      firstDate: widget.firstDate ?? DateTime(1950),
      lastDate: widget.lastDate ?? DateTime(now.year + 10),
    );

    if (pickedDate == null) {
      _focusNode.unfocus();
      return;
    }

    DateTime result = pickedDate;

    if (widget.includeTime) {
      if (!mounted) return;

      final pickedTime = await showTimePicker(
        context: context,
        initialTime: currentDate == null
            ? TimeOfDay.now()
            : TimeOfDay.fromDateTime(currentDate),
      );

      if (pickedTime == null) {
        _focusNode.unfocus();
        return;
      }

      result = DateTime(
        pickedDate.year,
        pickedDate.month,
        pickedDate.day,
        pickedTime.hour,
        pickedTime.minute,
      );
    }

    widget.controller.text = widget.includeTime
        ? _formatDateTime(result)
        : _formatDate(result);

    widget.onDateSelected?.call(result);
    setState(() {});

    _focusNode.unfocus();
  }

  DateTime? _parseDate(String value) {
    try {
      if (value.trim().isEmpty) return null;

      final parts = value.trim().split(' ');
      final dateParts = parts[0].split('/');

      if (dateParts.length != 3) return null;

      final day = int.parse(dateParts[0]);
      final month = int.parse(dateParts[1]);
      final year = int.parse(dateParts[2]);

      int hour = 0;
      int minute = 0;

      if (parts.length > 1) {
        final timeParts = parts[1].split(':');
        if (timeParts.length == 2) {
          hour = int.parse(timeParts[0]);
          minute = int.parse(timeParts[1]);
        }
      }

      return DateTime(year, month, day, hour, minute);
    } catch (_) {
      return null;
    }
  }

  String _formatDate(DateTime date) {
    final day = date.day.toString().padLeft(2, '0');
    final month = date.month.toString().padLeft(2, '0');
    final year = date.year.toString();
    return '$day/$month/$year';
  }

  String _formatDateTime(DateTime date) {
    final day = date.day.toString().padLeft(2, '0');
    final month = date.month.toString().padLeft(2, '0');
    final year = date.year.toString();
    final hour = date.hour.toString().padLeft(2, '0');
    final minute = date.minute.toString().padLeft(2, '0');

    return '$day/$month/$year $hour:$minute';
  }
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 54,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: _pickDate,
        child: InputDecorator(
          isFocused: isFocused,
          isEmpty: widget.controller.text.isEmpty,
          decoration: InputDecoration(
            labelText: widget.hintText,
            hintText: (isFocused || widget.controller.text.isNotEmpty)
                ? null
                : widget.hintText,
            labelStyle: const TextStyle(
              color: Color(0xFF9E9E9E),
              fontSize: 15,
            ),
            floatingLabelStyle: const TextStyle(
              color: Color(0xFF0E67B2),
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
            suffixIcon: const Icon(
              Icons.calendar_month_outlined,
              color: Color(0xFF0E67B2),
              size: 20,
            ),
            filled: true,
            fillColor: Colors.transparent,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 16,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: Color(0xFFD8D8D8),
                width: 1,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: Color(0xFF0E67B2),
                width: 1.2,
              ),
            ),
          ),
          child: Text(
            widget.controller.text,
            style: TextStyle(
              fontSize: 15,
              color: widget.controller.text.isEmpty
                  ? const Color(0xFF9E9E9E)
                  : const Color(0xFF333333),
            ),
          ),
        ),
      ),
    );
  }
}