import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/utils/time_convert.dart';

import '../../../../core/utils/currency_convert.dart';
import '../../domain/entities/Employee.dart';

class EmployeeDetailScreen extends ConsumerStatefulWidget {
  final String employeeId;

  const EmployeeDetailScreen({super.key, required this.employeeId});

  @override
  ConsumerState<EmployeeDetailScreen> createState() => _EmployeeDetailScreenState();
}

class _EmployeeDetailScreenState extends ConsumerState<EmployeeDetailScreen> {
  final employeeSample = Employee(
    id: '1',
    employeeId: "123",
    name: 'Truongnx',
    email: 'truongnguyen31032004@gmail.com',
    position: 'Nhân viên',
    department: 'Bộ phận Kế toán',
    status: EmployeeStatus.WORKING,
    phone: '0123456789',
    avatar: 'assets/images/profile.png',
    dateOfBirth: DateTime(1990, 1, 1),
    gender: Gender.MALE,
    address: '123 Đường ABC, Quận XYZ, TP.HCM',
    hireDate: DateTime(2020, 1, 1),
    salary: 15000000,
    bankAccount: '1234567890',
    bankName: 'Ngân hàng ABC',

  );

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFF0E6BA8);
    const textColor = Color(0xFF2F2F2F);
    const bgColor = Color(0xFFF8FAFC);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: bgColor,
        appBar: AppBar(
          backgroundColor: Color(0xFFF3F8FB),
          elevation: 0,
          surfaceTintColor: Colors.white,
          leading: IconButton(
            onPressed: () {
              Navigator.pop(context);
            },
            icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
          ),

          actions: [
            IconButton(
              onPressed: ()  {
                //todo
              },
              icon: const Icon(Icons.more_vert, color: Colors.black),
            ),
          ],
        ),
        body: SafeArea(
          child: Column(
            children: [
              //Header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
                decoration: const BoxDecoration(
                  color: Color(0xFFF3F8FB),
                ),
                child: Column(
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        //avatar
                        ClipOval(
                          child: Image.asset(
                            employeeSample.avatar ?? 'assets/images/profile.png',
                            width: 60,
                            height: 60,
                            fit: BoxFit.cover,
                          ),
                        ),
                        const SizedBox(width: 18),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 8),
                              Text(
                                employeeSample.name,
                                style: const TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w800,
                                  color: textColor,
                                  height: 1.1,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                '${employeeSample.position} | ${employeeSample.department}',
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
                    const SizedBox(height: 20),
                    const TabBar(
                      labelColor: primaryColor,
                      unselectedLabelColor: Color(0xFFAAAAAA),
                      indicatorColor: primaryColor,
                      indicatorWeight: 2,
                      labelStyle: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                      unselectedLabelStyle: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                      tabs: [
                        Tab(text: 'Cá nhân'),
                        Tab(text: 'Công việc'),
                      ],
                    ),
                  ],
                ),
              ),
              Expanded(
                child: TabBarView(
                  children: [
                    _PersonalTab(employee: employeeSample,),
                    _WorkTab(employee: employeeSample,),
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

class _PersonalTab extends StatelessWidget {
  final Employee employee;
  _PersonalTab( {super.key, required this.employee});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      child: Column(
        children: [
          _InfoSectionCard(
            title: 'Thông tin cơ bản',
            items: [
              _InfoItem(label: 'Họ tên', value: employee.name),
              _InfoItem(
                label: 'Email',
                value: employee.email,
                trailingIcon: Icons.copy_rounded,
              ),
              _InfoItem(label: 'Số điện thoại', value: employee.phone ?? '-'),
              _InfoItem(label: 'Ngày sinh', value: TimeConvert.convertDateTimeToString(employee.dateOfBirth)),
              _InfoItem(label: 'Giới tính', value: employee.gender?.displayName ?? '-'),
              _InfoItem(
                label: 'Địa chỉ',
                value: employee.address ?? '-',
              ),
              _InfoItem(
                label: 'Tài khoản ngân hàng',
                value: '${employee.bankName ?? ''} - ${employee.bankAccount ?? ''}',
              ),
            ],
          ),
          const SizedBox(height: 16),
          _InfoSectionCard(
            title: 'Thông tin thêm',
            items: [
              _InfoItem(label: 'Dân tộc', value: employee.nationality ?? '-'),
              _InfoItem(label: 'Tôn giáo', value: employee.religion ?? '-'),
              _InfoItem(label: 'Tình trạng hôn nhân', value: employee.maritalStatus ?? '-'),
            ],
          ),
        ],
      ),
    );
  }
}

class _WorkTab extends StatelessWidget {
  final Employee employee;
  _WorkTab({super.key, required this.employee});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      child: Column(
        children: [
          _InfoSectionCard(
            title: 'Thông tin công việc',
            items: [
              _InfoItem(label: 'Mã nhân viên', value: employee.employeeId),
               _InfoItem(label: 'Phòng ban', value: employee.department ?? '-'),
               _InfoItem(label: 'Chức vụ', value: employee.position),
               _InfoItem(label: 'Ngày vào làm', value: TimeConvert.convertDateTimeToString(employee.hireDate)),
               _InfoItem(label: 'Mức lương', value: CurrencyConvert.convertToCurrency(employee.salary)),
            ],
          ),
        ],
      ),
    );
  }
}

class _InfoSectionCard extends StatelessWidget {
  final String title;
  final List<_InfoItem> items;

  const _InfoSectionCard({
    required this.title,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    const cardBorderColor = Color(0xFFE8E8E8);
    const titleColor = Color(0xFF2F2F2F);
    const editBg = Color(0xFFF1F7FB);
    const primaryColor = Color(0xFF0E6BA8);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: cardBorderColor),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: titleColor,
                  ),
                ),
              ),
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: editBg,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: IconButton(
                  onPressed: () {},
                  icon: const Icon(
                    Icons.edit_outlined,
                    color: primaryColor,
                    size: 22,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          ...items.map((e) => _InfoRow(item: e)),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final _InfoItem item;

  const _InfoRow({required this.item});

  @override
  Widget build(BuildContext context) {
    const labelColor = Color(0xFF9A9A9A);
    const valueColor = Color(0xFF333333);
    const primaryColor = Color(0xFF0E6BA8);

    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              item.label,
              style: const TextStyle(
                fontSize: 14,
                color: labelColor,
                fontWeight: FontWeight.w500,
                height: 1.35,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    item.value,
                    style: const TextStyle(
                      fontSize: 14,
                      color: valueColor,
                      fontWeight: FontWeight.w600,
                      height: 1.35,
                    ),
                  ),
                ),
                if (item.trailingIcon != null) ...[
                  const SizedBox(width: 8),
                  InkWell(
                    onTap: () {},
                    borderRadius: BorderRadius.circular(8),
                    child: Padding(
                      padding: const EdgeInsets.all(2),
                      child: Icon(
                        item.trailingIcon,
                        size: 20,
                        color: primaryColor,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoItem {
  final String label;
  final String value;
  final IconData? trailingIcon;

  const _InfoItem({
    required this.label,
    required this.value,
    this.trailingIcon,
  });
}

