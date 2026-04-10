import 'package:flutter/material.dart';
import 'main_bottom_nav.dart';

class MainShellPage extends StatelessWidget {
  final Widget child;
  final int currentIndex;
  final void Function(int index) onTap;

  const MainShellPage({
    super.key,
    required this.child,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: SafeArea(
        top: false,
        child: MainBottomNav(
          currentIndex: currentIndex,
          onTap: onTap,
        ),
      ),

    );
  }
}