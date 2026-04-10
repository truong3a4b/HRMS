import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class NotificationScreen extends ConsumerStatefulWidget{
  const NotificationScreen({super.key});

  @override
  ConsumerState<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends ConsumerState<NotificationScreen> {
  @override
  Widget build(BuildContext context) {
    final notifications = [
      const NotificationItemData(
        title: 'Ứng viên mới',
        message: 'Bạn có 1 ứng viên mới đã nộp đơn vào vị trí Nhân viên Kinh doanh.',
        time: '23/03/2026 20:56',
        showDot: true,
      ),
      const NotificationItemData(
        title: 'Cập nhật công việc',
        message: 'Công việc "Nhân viên Kinh doanh" đã được cập nhật thông tin mới.',
        time: '22/03/2026 18:30',
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Thông báo',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: Colors.black,
          ),
        ),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.more_vert, color: Colors.black),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(
            height: 1,
            color: const Color(0xFFEAEAEA),
          ),
        ),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.only(top: 12),
        itemCount: notifications.length,
        separatorBuilder: (_, __) => const SizedBox(height: 4),
        itemBuilder: (context, index) {
          return NotificationItem(
            data: notifications[index],
            onTap: () {},
          );
        },
      ),
    );
  }
}
class NotificationItemData {
  final String title;
  final String message;
  final String time;
  final String? imageUrl;
  final bool showDot;

  const NotificationItemData({
    required this.title,
    required this.message,
    required this.time,
    this.imageUrl,
    this.showDot = false,
  });
}
class NotificationItem extends StatelessWidget {
  final NotificationItemData data;
  final VoidCallback? onTap;

  const NotificationItem({
    super.key,
    required this.data,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Container(
          color: data.showDot ? const Color(0xFFFFF2F0) : Colors.white,
          padding: const EdgeInsets.fromLTRB(10, 10, 14, 10),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              NotificationAvatar(showDot: data.showDot),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      data.title,
                      style: const TextStyle(
                        fontSize: 15.5,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF222222),
                        height: 1.15,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      data.message,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                        color: Color(0xFF444444),
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      data.time,
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF9E9E9E),
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class NotificationAvatar extends StatelessWidget {
  final bool showDot;

  const NotificationAvatar({
    super.key,
    this.showDot = false,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          width: 52,
          height: 52,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            color: Color(0xFFF8E9E4),
          ),
          child: const Icon(
            Icons.handyman_rounded,
            size: 26,
            color: Color(0xFFFF8A3D),
          ),
        ),
        if (showDot)
          Positioned(
            top: 2,
            right: 2,
            child: Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: const Color(0xFFFF4D4F),
                shape: BoxShape.circle,
                border: Border.all(
                  color: Colors.white,
                  width: 2,
                ),
              ),
            ),
          ),
      ],
    );
  }
}