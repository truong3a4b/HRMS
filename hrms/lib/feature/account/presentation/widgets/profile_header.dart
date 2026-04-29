import 'package:flutter/material.dart';

class ProfileHeader extends StatelessWidget {
  final String? avatar;
  final String name;
  final String subtitle;
  final bool showTabs;
  final List<Widget> tabs;

  const ProfileHeader({
    super.key,
    required this.avatar,
    required this.name,
    required this.subtitle,
    this.showTabs = false,
    this.tabs = const [
      Tab(text: 'Cá nhân'),
      Tab(text: 'Công việc'),
    ],
  });

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFF0E6BA8);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      decoration: const BoxDecoration(color: Color(0xFFF3F8FB)),
      child: Column(
        children: [
          Row(
            children: [
              ClipOval(
                child: avatar != null && avatar!.isNotEmpty
                    ? Image.network(
                  avatar!,
                  width: 60,
                  height: 60,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => _defaultAvatar(),
                )
                    : _defaultAvatar(),
              ),
              const SizedBox(width: 18),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF2F2F2F),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF55606D),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (showTabs) ...[
            const SizedBox(height: 20),
            TabBar(
              labelColor: primaryColor,
              unselectedLabelColor: const Color(0xFFAAAAAA),
              indicatorColor: primaryColor,
              indicatorWeight: 2,
              labelStyle: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
              ),
              unselectedLabelStyle: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
              tabs: tabs,
            ),
          ],
        ],
      ),
    );
  }
  Widget _defaultAvatar() {
    return Image.asset(
      'assets/images/profile.png',
      width: 60,
      height: 60,
      fit: BoxFit.cover,
    );
  }
}