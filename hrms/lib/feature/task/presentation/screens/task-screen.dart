import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class TaskScreen extends ConsumerStatefulWidget {
  const TaskScreen({super.key});

  @override
  ConsumerState<TaskScreen> createState() => _TaskScreenState();
}

class _TaskScreenState extends ConsumerState<TaskScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xC7EDEDED),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Tác vụ',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: Colors.black,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TaskGroupCard(
                title: 'Tuyển dụng',
                items: [
                  TaskItemData(
                    icon: 'assets/images/candidate.png',
                    label: 'Danh sách ứng viên',
                  ),
                  TaskItemData(
                    icon: 'assets/images/recruitment.png',
                    label: 'Vị trí tuyển dụng',
                    onTap: (){
                      context.push('/recruitment-job-list');
                    }
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TaskGroupCard(
                title: 'Nhân viên',
                items: [
                  TaskItemData(
                    icon: 'assets/images/employee_list.png',
                    label: 'Danh sách\nnhân viên',
                    onTap: () {
                      context.push('/employee-list');
                    }
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TaskGroupCard(
                title: 'Chấm công',
                items: [
                  TaskItemData(
                    icon: 'assets/images/checkin.png',
                    label: 'Chấm công',
                  ),
                  TaskItemData(
                    icon: 'assets/images/history_checkin.png',
                    label: 'Lịch sử chấm công',
                  ),
                  TaskItemData(
                    icon: 'assets/images/checkin_table.png',
                    label: 'Bảng công',
                  ),
                  TaskItemData(
                    icon: 'assets/images/add_schedule.png',
                    label: 'Đề xuất cộng công',
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TaskGroupCard(
                title: 'Lịch làm việc',
                items: [
                  TaskItemData(
                    icon: 'assets/images/schedule_week.png',
                    label: 'Lịch làm việc theo tuần',
                  ),
                  TaskItemData(
                    icon: 'assets/images/auto_schedule.png',
                    label: 'Xếp lịch làm việc',
                  ),
                  TaskItemData(
                    icon: 'assets/images/leave.png',
                    label: 'Xin nghỉ phép',
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TaskGroupCard(
                title: 'Lương',
                items: [
                  TaskItemData(
                    icon: 'assets/images/salary.png',
                    label: 'Lương hiện tại',
                  ),
                  TaskItemData(
                    icon: 'assets/images/wages.png',
                    label: 'Tạm ứng',
                  ),
                  TaskItemData(
                    icon: 'assets/images/add_money.png',
                    label: 'Phiếu cộng lương',
                  ),
                  TaskItemData(
                    icon: 'assets/images/remove_money.png',
                    label: 'Phiếu trừ lương',
                  ),
                  TaskItemData(
                    icon: 'assets/images/money_paper.png',
                    label: 'Phiếu lương',
                  ),
                  TaskItemData(
                    icon: 'assets/images/salary_setting.png',
                    label: 'Lịch sử điều chỉnh lương',
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TaskGroupCard(
                title: 'Phòng ban',
                items: [
                  TaskItemData(
                    icon: 'assets/images/room_setting.png',
                    label: 'Danh sách phòng ban',
                    onTap: (){
                      context.push('/department-list');
                    }
                  ),
                  TaskItemData(
                    icon: 'assets/images/department.png',
                    label: 'Thông tin phòng ban',
                  ),
                  TaskItemData(
                    icon: 'assets/images/target.png',
                    label: 'Nhiệm vụ',
                  ),
                  TaskItemData(
                    icon: 'assets/images/asign_task.png',
                    label: 'Giao nhiêm vụ',
                  ),
                  TaskItemData(
                    icon: 'assets/images/proposal.png',
                    label: 'Đề xuất',
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TaskGroupCard(
                title: 'Cài đặt',
                items: [
                  TaskItemData(
                    icon: 'assets/images/checkin_setting.png',
                    label: 'Cấu hình chấm công',
                  ),
                  TaskItemData(
                    icon: 'assets/images/money_setting.png',
                    label: 'Câu hình tính lương',
                  ),
                  TaskItemData(
                    icon: 'assets/images/postion_setting.png',
                    label: 'Chức danh',
                    onTap: (){
                      context.push('/position-list');
                    }
                  ),
                  TaskItemData(
                    icon: 'assets/images/people_time.png',
                    label: 'Ca làm việc',
                  ),
                  TaskItemData(
                      icon: 'assets/images/star_schedule.png',
                      label: 'Loại ngày nghỉ',
                    ),

                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class TaskItemData {
  final String icon;
  final String label;
  final VoidCallback? onTap;

  const TaskItemData({
    required this.icon,
    required this.label,
    this.onTap,
  });
}

class TaskGroupCard extends StatelessWidget {
  final String title;
  final List<TaskItemData> items;

  const TaskGroupCard({
    super.key,
    required this.title,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    const double horizontalSpacing = 12;
    const int maxItemsPerRow = 3;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: Color(0xFF333333),
            ),
          ),
          const SizedBox(height: 14),
          Column(
            children: List.generate(
              (items.length / maxItemsPerRow).ceil(),
                  (rowIndex) {
                final start = rowIndex * maxItemsPerRow;
                final end = (start + maxItemsPerRow > items.length)
                    ? items.length
                    : start + maxItemsPerRow;

                final rowItems = items.sublist(start, end);

                return Padding(
                  padding: EdgeInsets.only(
                    bottom: rowIndex < (items.length / maxItemsPerRow).ceil() - 1
                        ? 18
                        : 0,
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      for (int i = 0; i < maxItemsPerRow; i++) ...[
                        Expanded(
                          child: i < rowItems.length
                              ? TaskActionButton(
                            icon: rowItems[i].icon,
                            label: rowItems[i].label,
                            onTap: rowItems[i].onTap,
                          )
                              : const SizedBox(),
                        ),
                        if (i < maxItemsPerRow - 1)
                          const SizedBox(width: horizontalSpacing),
                      ],
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class TaskActionButton extends StatelessWidget {
  final String icon;
  final String label;
  final VoidCallback? onTap;

  const TaskActionButton({
    super.key,
    required this.icon,
    required this.label,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: onTap ?? () {},
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: const Color(0xFFE6EEF2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Image.asset(
                    icon,
                    width: 28,
                    height: 28,
                    fit: BoxFit.contain,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                label,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 13,
                  height: 1.2,
                  fontWeight: FontWeight.w400,
                  color: Color(0xFF222222),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
