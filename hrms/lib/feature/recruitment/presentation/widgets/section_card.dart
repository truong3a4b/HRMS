
import 'package:flutter/material.dart';

class SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Widget child;
  final bool canAdd;
  final VoidCallback? onAdd;

  const SectionCard({
    super.key,
    required this.title,
    required this.icon,
    required this.child,
    this.canAdd = false,
    this.onAdd,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 20, color: const Color(0xFF0069B4)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1A1A1A),
                  ),
                ),
              ),
              if (canAdd)
                Container(
                    width: 32,
                    height: 32,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE0F0FF),
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: IconButton(padding: EdgeInsets.zero,onPressed: onAdd, icon: const Icon(Icons.add, size: 18, color: Color(0xFF0069B4)),)

                ),
            ],
          ),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}