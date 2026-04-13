import 'package:flutter/material.dart';

class SearchBox extends StatelessWidget {
  final TextEditingController controller;
  final String hintText;
  final VoidCallback? onSearch;

  const SearchBox({super.key, required this.controller, required this.hintText, this.onSearch});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFE3E3E3)),
        borderRadius: BorderRadius.circular(12),
      ),
      alignment: Alignment.center,
      child: TextField(
        controller: controller,
        textAlignVertical:TextAlignVertical.center,
        decoration: InputDecoration(
          hintText: hintText,
          hintStyle: const TextStyle(fontSize: 14, color: Color(0xFFB0B0B0)),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 14),
          suffixIcon: IconButton(
            icon: const Icon(Icons.search, size: 22),
            onPressed: onSearch,
          ),
        ),
        cursorColor: Colors.black,
        onSubmitted: (_) => onSearch?.call(),
      ),
    );
  }
}