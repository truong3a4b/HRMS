import 'package:flutter/material.dart';

class LogoSection extends StatelessWidget {
  const LogoSection();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: const [
        Text(
          'HRMS',
          style: TextStyle(
            fontSize: 34,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.2,
            color: Colors.white,
            height: 1,
          ),
        ),
        SizedBox(height: 2),
        Text(
          'Powered by NXT',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: Colors.white70,
          ),
        ),
      ],
    );
  }
}