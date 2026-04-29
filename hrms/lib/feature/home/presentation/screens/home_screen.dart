import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/domain/entities/user.dart';
import '../../../employee/domain/entities/employee.dart';
import '../../../position/domain/entities/position.dart';
import '../providers/home_provider.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    final asyncValue = ref.watch(homeProvider);
    return Scaffold(
      backgroundColor: Color(0xFFFAFAFA),
      body: asyncValue.when(
        data: _buildContent,
        error: error,
        loading: loading,
      ),
    );
  }

  Widget _buildContent(HomeState state) {
    final showCheckInCard = state.role == UserRole.employee;
    final showPendingCard =
        state.role == UserRole.admin;
    final showFeatureSection = state.role == UserRole.employee;
    final showTodayTaskSection = state.role == UserRole.employee;
    final showTodaySummary = state.role == UserRole.admin;
    final isDay = DateTime.now().hour >= 6 && DateTime.now().hour < 18;
    String position = 'Ứng viên';
    if(state.me is Employee){
      position = (state.me as Employee).position?.name ?? ' ';
    }

    return SingleChildScrollView(
      physics: const ClampingScrollPhysics(),
      child: Stack(
        children: [
          SizedBox(
            height: 300,
            width: double.infinity,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.asset(
                  isDay ? 'assets/images/home_background_day.jpg' :'assets/images/home_background_night.jpg',
                  fit: BoxFit.cover,
                ),
                Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        Color(0xB3FBFBFB),
                        Colors.white,
                      ],
                      stops: [0.6, 0.85, 1],
                    ),
                  ),
                ),
              ],
            ),
          ),

          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  GreetingSection(
                    name: state.me?.name ?? '',
                    position: position,
                    role: state.role ?? UserRole.employee,
                  ),
                  const SizedBox(height: 20),

                  if (showCheckInCard) ...[
                    const CheckInCard(),
                    const SizedBox(height: 16),
                  ],

                  if (showFeatureSection) ...[
                    HomeFeatureSection(),
                    const SizedBox(height: 24),
                  ],

                  if (showPendingCard) ...[
                    const PendingCard(),
                    const SizedBox(height: 24),
                  ],

                  if (showTodayTaskSection) ...[
                    const HomeQuestionSection(),
                    const SizedBox(height: 24),
                  ],

                  if (showTodaySummary) ...[
                    TodaySummary(),
                    const SizedBox(height: 24),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget error(Object error, StackTrace stackTrace) {
    final errorMessage = error.toString();
    print("Error home: $errorMessage");
    debugPrintStack(stackTrace: stackTrace);
    return Center(
      child: Text(
        errorMessage,
        style: const TextStyle(color: Colors.red, fontSize: 14),
        textAlign: TextAlign.center,
      ),
    );
  }

  Widget loading() {
    return const Center(child: CircularProgressIndicator());
  }
}

class GreetingSection extends StatelessWidget {
  final String name;
  final String avatarUrl;
  final String? position;
  final UserRole role;
  final bool isDay;
  const GreetingSection({super.key, required this.name, this.position, required this.role, this.avatarUrl = 'assets/images/profile.png', this.isDay = true});

  @override
  Widget build(BuildContext context) {

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          isDay ? 'Chào buổi sáng' : 'Chào buổi tối',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w800,
            color: Colors.white,
            shadows: [
              Shadow(
                blurRadius: 4,
                color: Color(0x66000000),
                offset: const Offset(0, 1),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Row(
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
                  avatarUrl,
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                 Text(
                  name,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    shadows: [
                      Shadow(
                        blurRadius: 4,
                        color: Color(0x66000000),
                        offset: const Offset(0, 1),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: Color(0xA8D5D5D6),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Text(
                    position ?? role.toDisplayString,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      shadows: [
                        Shadow(
                          blurRadius: 4,
                          color: Color(0x66000000),
                          offset: const Offset(0, 1),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 72),
        const Center(
          child: Text(
            'Chúc bạn một ngày làm việc hiệu quả',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w700,
              shadows: [
                Shadow(
                  blurRadius: 4,
                  color: Color(0x66000000),
                  offset: const Offset(0, 1),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class CheckInCard extends StatelessWidget {
  const CheckInCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          // TODO: xử lý khi bấm
          print("Chấm công clicked");
        },
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            gradient: const LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFF9D49FA), Color(0xFF4F4FFF), Color(0xFF0325D1)],
            ),
            boxShadow: const [
              BoxShadow(
                color: Color(0x22000000),
                blurRadius: 18,
                offset: Offset(0, 8),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Image.asset(
                    'assets/images/checkin.png',
                    width: 34,
                    height: 34,
                    fit: BoxFit.contain,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Chấm công',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'để bắt đầu công việc thôi nào!',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
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

class HomeFeatureCard extends StatelessWidget {
  final String icon;
  final String title;
  final String subtitle;

  const HomeFeatureCard({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width:
          (MediaQuery.of(context).size.width - 18 * 3) /
          2, //  chia 2 card / hàng
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          boxShadow: const [
            BoxShadow(
              color: Color(0x10000000),
              blurRadius: 16,
              offset: Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset(icon, width: 34, height: 34),
            const SizedBox(height: 8),
            Text(
              title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: Color(0xFF222222),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class HomeFeatureSection extends StatelessWidget {
  const HomeFeatureSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 14,
      runSpacing: 14,
      children: const [
        HomeFeatureCard(
          icon: 'assets/images/schedule.png',
          title: 'Lịch làm việc',
          subtitle: '',
        ),
        HomeFeatureCard(
          icon: 'assets/images/leave.png',
          title: 'Đăng ký nghỉ',
          subtitle: '',
        ),
        HomeFeatureCard(
          icon: 'assets/images/salary.png',
          title: 'Kỳ lương',
          subtitle: '',
        ),
        HomeFeatureCard(
          icon: 'assets/images/newspaper.png',
          title: 'Bảng tin',
          subtitle: '',
        ),
      ],
    );
  }
}

//Công việc hôm nay
class HomeQuestionSection extends StatelessWidget {
  const HomeQuestionSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Công việc hôm nay',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: Color(0xFF222222),
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: const [
              BoxShadow(
                color: Color(0x10000000),
                blurRadius: 16,
                offset: Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Bảo trì hệ thống máy chủ',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF222222),
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Color(0xFFE0E0E0),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'Đang tiến hành',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF555555),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'Hạn chót: 31/03/2026',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF555555),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class PendingCard extends StatelessWidget {
  const PendingCard({super.key});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Color(0x6BE5ECF4),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Color(0x91EDECEC)),
          ),
          child: InkWell(
            onTap: () {
              //todo: xử lý khi bấm vào yêu cầu chờ duyệt
              print("Yêu cầu chờ duyệt clicked");
            },
            child: Container(
              width: double.infinity,
              height: 60,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: Color(0xFFFFFFFF),
                borderRadius: BorderRadius.circular(8),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Image.asset(
                        'assets/images/validation.png',
                        width: 34,
                        height: 34,
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                  SizedBox(width: 12),
                  Text(
                    'Không có yêu cầu chờ duyệt',
                    style: TextStyle(fontSize: 14),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class TodaySummary extends StatelessWidget {
  const TodaySummary({super.key});

  @override
  Widget build(BuildContext context) {
    const gap = 12.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Hôm nay',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
            ),
            TextButton(
              onPressed: () {
                print("Xem thêm công việc hôm nay clicked");
              },
              child: const Text(
                'Xem thêm',
                style: TextStyle(fontSize: 14, color: Colors.blue),
              ),
            ),
          ],
        ),

        const SizedBox(height: 12),

        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: gap,
          crossAxisSpacing: gap,
          childAspectRatio: 2.25,
          children: const [
            _StatCard(
              value: '3',
              label: 'Đi muộn',
              color: Color(0xFFFFF4E5),
              icon: Icons.timelapse
            ),
            _StatCard(
              value: '1',
              label: 'Về sớm',
              color: Color(0xFFE5F9F4),
              icon: Icons.run_circle,
            ),
            _StatCard(
              value: '1',
              label: 'Quên check-in',
              color: Color(0xFFE9EDCE),
              icon: Icons.input,
            ),
            _StatCard(
              value: '1',
              label: 'Quên check-out',
              color: Color(0xFFF8F0E1),
              icon: Icons.output,
            ),
            _StatCard(
              value: '1',
              label: 'Nghỉ phép',
              color: Color(0xFFECE1FB),
              icon: Icons.beach_access,
            ),
            _StatCard(
              value: '1',
              label: 'Nghỉ không phép',
              color: Color(0xFFF8CFCF),
              icon: Icons.do_not_disturb_on_outlined,
            ),
          ],
        ),
      ],
    );
  }
}
class _StatCard extends StatelessWidget {
  final String value;
  final String label;
  final Color color;
  final IconData icon;

  const _StatCard({
    required this.value,
    required this.label,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 8, 8),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Stack(
        children: [
          Positioned(
            right: 0,
            top: 0,
            child: Icon(
              icon,
              size: 36,
              color: Color(0x2C888888)
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                value,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                label,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 12),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
