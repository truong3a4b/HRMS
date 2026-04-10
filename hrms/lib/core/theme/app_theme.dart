import 'package:flutter/material.dart';

import 'app_typography.dart';

class AppTheme {
  static final ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: Colors.white,
    textTheme: AppTypography.textTheme.apply(
      bodyColor: Colors.black,
      displayColor: Colors.black,
    ),
  );

}