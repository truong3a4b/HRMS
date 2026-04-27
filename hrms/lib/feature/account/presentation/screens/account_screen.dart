import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/widget/app_confirm_dialog.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class AccountScreen extends ConsumerStatefulWidget {
  const AccountScreen({super.key});

  @override
  ConsumerState<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends ConsumerState<AccountScreen> {

  void _handleLogout() {
    final isLoading = ref.watch(authNotifierProvider).isLoading;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {

        return AppConfirmDialog(
          title: 'Thông báo',
          message: 'Bạn có chắc chắn muốn đăng xuất không?',
          isLoading: isLoading,
          onCancel: () => Navigator.pop(context),
          onConfirm: () {
            ref.read(authNotifierProvider.notifier).logout();
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final items = <SettingItemData>[
      const SettingItemData(
        icon: Icons.lock_outline,
        title: 'Bảo mật',
        subtitle: 'Danh sách thiết bị đăng nhập, đổi mật khẩu',
      ),
      const SettingItemData(
        icon: Icons.markunread_mailbox_outlined,
        title: 'Đóng góp ý kiến, báo lỗi',
        subtitle: 'Đóng góp ý kiến, báo lỗi',
      ),
      SettingItemData(
        icon: Icons.logout,
        title: 'Đăng xuất',
        titleColor: Color(0xFFFF3B30),
        iconColor: Color(0xFFFF3B30),
        onTap: _handleLogout,
      ),
    ];
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 6),
            _ProfileHeader(
              name: 'Nguyễn Xuân Trưởng',
              subtitle: 'Chỉnh sửa thông tin cá nhân',
              onTap: () {},
            ),
            const Divider(height: 1, color: Color(0xFFEAEAEA)),
            Expanded(
              child: ListView.separated(
                padding: EdgeInsets.zero,
                itemCount: items.length,
                separatorBuilder: (_, __) =>
                    const Divider(height: 1, color: Color(0xFFEAEAEA)),
                itemBuilder: (context, index) {
                  final item = items[index];
                  final bool isLogout = item.title == 'Đăng xuất';

                  return _SettingTile(
                    icon: item.icon,
                    title: item.title,
                    subtitle: item.subtitle,
                    iconColor: item.iconColor,
                    titleColor: item.titleColor,
                    isLogout: isLogout,
                    onTap: item.onTap ?? () {},
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SettingItemData {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Color iconColor;
  final Color titleColor;
  final VoidCallback? onTap;

  const SettingItemData({
    required this.icon,
    required this.title,
    this.subtitle,
    this.iconColor = const Color(0xFF7A7A7A),
    this.titleColor = const Color(0xFF111111),
    this.onTap,
  });
}

class _ProfileHeader extends StatelessWidget {
  final String name;
  final String subtitle;
  final VoidCallback? onTap;

  const _ProfileHeader({
    required this.name,
    required this.subtitle,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        color: Colors.white,
        padding: const EdgeInsets.fromLTRB(16, 14, 12, 14),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white,
              ),
              child: ClipOval(
                child: Image.asset(
                  'assets/images/profile.png',
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF111111),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Color(0xFF9A9A9A),
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, size: 22, color: Color(0xFF9E9E9E)),
          ],
        ),
      ),
    );
  }
}

class _SettingTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Color iconColor;
  final Color titleColor;
  final bool isLogout;
  final VoidCallback? onTap;

  const _SettingTile({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.iconColor,
    required this.titleColor,
    required this.isLogout,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 12, 12),
          child: Row(
            children: [
              SizedBox(
                width: 28,
                child: Icon(icon, size: 22, color: iconColor),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: titleColor,
                      ),
                    ),
                    if (subtitle != null && subtitle!.isNotEmpty) ...[
                      const SizedBox(height: 3),
                      Text(
                        subtitle!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 13.5,
                          color: Color(0xFFAAAAAA),
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(width: 8),
              const Icon(
                Icons.chevron_right,
                size: 22,
                color: Color(0xFFB0B0B0),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
