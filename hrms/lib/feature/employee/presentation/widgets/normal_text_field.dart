import 'package:flutter/material.dart';

class NormalTextField extends StatefulWidget {
  final TextEditingController controller;
  final String hintText;
  final TextInputType? keyboardType;

  const NormalTextField({
    super.key,
    required this.controller,
    required this.hintText,
    this.keyboardType,
  });

  @override
  State<NormalTextField> createState() => _NormalTextFieldState();
}

class _NormalTextFieldState extends State<NormalTextField> {
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

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 54,
      child: TextField(
        controller: widget.controller,
        focusNode: _focusNode,
        keyboardType: widget.keyboardType,
        style: const TextStyle(fontSize: 15, color: Color(0xFF333333)),
        decoration: InputDecoration(
          labelText: widget.hintText,

          // Ẩn hint khi focus hoặc có text
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

          filled: true,
          fillColor: Colors.transparent,

          contentPadding: const EdgeInsets.symmetric(
            horizontal: 14,
            vertical: 16,
          ),

          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFD8D8D8)),
          ),

          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(
              color: Color(0xFF0E67B2),
              width: 1.2,
            ),
          ),
        ),
      ),
    );
  }
}