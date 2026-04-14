import 'package:flutter/material.dart';

class DatePickerField extends StatefulWidget {
  final TextEditingController controller;
  final String hintText;
  final DateTime? firstDate;
  final DateTime? lastDate;
  final ValueChanged<DateTime?>? onDateSelected;

  const DatePickerField({
    super.key,
    required this.controller,
    required this.hintText,
    this.firstDate,
    this.lastDate,
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
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: _parseDate(widget.controller.text) ?? DateTime.now(),
      firstDate: widget.firstDate ?? DateTime(1950),
      lastDate: widget.lastDate ?? DateTime(now.year + 10),
    );

    if (pickedDate != null) {
      widget.controller.text = _formatDate(pickedDate);
      widget.onDateSelected?.call(pickedDate);
      setState(() {});
    }

    _focusNode.unfocus();
  }

  DateTime? _parseDate(String value) {
    try {
      final parts = value.split('/');
      if (parts.length != 3) return null;

      final day = int.parse(parts[0]);
      final month = int.parse(parts[1]);
      final year = int.parse(parts[2]);

      return DateTime(year, month, day);
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