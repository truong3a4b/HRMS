import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/widget/search_box.dart';
import '../../domain/entities/Employee.dart';
import '../widgets/employee_filter_bottom_sheet.dart';

class EmployeeListScreen extends ConsumerStatefulWidget {
  const EmployeeListScreen({super.key});

  @override
  ConsumerState<EmployeeListScreen> createState() => _EmployeeListScreenState();
}

class _EmployeeListScreenState extends ConsumerState<EmployeeListScreen> {


  final List<FilterItem> filters = [
    FilterItem(
      key: "position",
      title: "Chọn chức danh",
      options: [
        FilterOption(value: "all", label: "Tất cả chức danh"),
        FilterOption(value: "manager", label: "Quản lý"),
        FilterOption(value: "staff", label: "Nhân viên"),
      ],
    ),
    FilterItem(
      key: "department",
      title: "Chọn phòng ban",
      options: [
        FilterOption(value: "all", label: "Tất cả phòng ban"),
        FilterOption(value: "accounting", label: "Bộ phận Kế toán"),
        FilterOption(value: "hr", label: "Bộ phận Nhân sự"),
        FilterOption(value: "it", label: "Bộ phận IT"),
      ],
    ),
    FilterItem(
      key: "status",
      title: "Chọn trạng thái",
      options: [
        FilterOption(value: "all", label: "Tất cả trạng thái"),
        FilterOption(value: "working", label: "Đang làm việc"),
        FilterOption(value: "on_leave", label: "Đang nghỉ phép"),
        FilterOption(value: "resigned", label: "Đã nghỉ việc"),
      ],
    ),
  ];

  final List<Employee> employees = [
    Employee(
      id: '1',
      employeeId: "123",
      name: 'Truongnx',
      email: 'toriv70767@fpxnet.com',
      department: '-',
      status: EmployeeStatus.WORKING,
      position: 'Nhân viên',
    ),
    Employee(
      id: '2',
      employeeId: "123",
      name: '123 -11',
      email: 'rter@gmail.com',
      department: 'Bộ phận Kế toán',
      status: EmployeeStatus.ON_LEAVE,
      position: 'Nhân viên',
    ),
    Employee(
      id: '3',
      employeeId: "123",
      name: 'DEMO - Nhân viên',
      email: 'toriv70767@hrmdemo.com',
      department: 'Bộ phận Kế toán',
      status: EmployeeStatus.ON_LEAVE,
      position: 'Nhân viên',
    ),
    Employee(
      id: '4',
      employeeId: "123",
      name: 'Q323432 - Sdad Đá',
      email: 'wihey50853@lealking.com',
      department: 'Bộ phận Kế toán',
      status: EmployeeStatus.RESIGNED,
      position: 'Nhân viên',
    ),
  ];

  FilterResult _filterResult = FilterResult({});
  final TextEditingController searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    for (var filter in filters) {
      _filterResult[filter.key] = filter.options.first;
    }
  }

  @override
  void dispose() {
    searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F3F3),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          onPressed: () {
            Navigator.pop(context);
          },
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
        ),
        title: const Text(
          'Danh sách nhân viên',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        titleSpacing: 0,
        centerTitle: false,
        actions: [
          //nut filter
          IconButton(
            onPressed: () async {
              _filterResult =
                  await showModalBottomSheet<FilterResult>(
                    context: context,
                    isScrollControlled: true,
                    backgroundColor: Colors.transparent,
                    useRootNavigator: true,
                    builder: (context) {
                      return EmployeeFilterBottomSheet(
                        filters: filters,
                        filterResult: _filterResult,
                      );
                    },
                  ) ??
                  _filterResult;
              setState(() {});
            },
            icon: const Icon(Icons.filter_alt_outlined, color: Colors.black),
          ),
        ],
      ),
      //nut them moi nhan vien
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          context.push('/add-employee');
        },
        backgroundColor: const Color(0xFF0069B4),
        shape: const CircleBorder(),
        child: const Icon(Icons.add, color: Colors.white, size: 30),
      ),
      body: Column(
        children: [
          //search box
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
            child: SearchBox(
              controller: searchController,
              hintText: 'Tìm kiếm nhân viên',
            ),
          ),

          Container(
            color: Colors.white,
            padding: const EdgeInsets.only(bottom: 10),
            //list filter
            child: SizedBox(
              height: 42,
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                scrollDirection: Axis.horizontal,
                itemCount: filters.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final filter = filters[index];
                  return ChoiceChip(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    label: Text(
                      _filterResult[filter.key]?.label ??
                          filter.options.first.label,
                      style: TextStyle(fontSize: 13),
                    ),
                    selected: false,
                    showCheckmark: false,
                    onSelected: (_) {},
                    backgroundColor: const Color(0xFFEAEAEA),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                      side: BorderSide.none,
                    ),
                  );
                },
              ),
            ),
          ),
          const SizedBox(height: 10),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              itemCount: employees.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final employee = employees[index];
                return EmployeeCard(employee: employee);
              },
            ),
          ),
        ],
      ),
    );
  }
}

// Widget hiển thị thông tin nhân viên trong danh sách
class EmployeeCard extends StatelessWidget {
  final Employee employee;

  const EmployeeCard({super.key, required this.employee});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        context.push('/employee-detail/${employee.id}');
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 42,
              height: 42,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFD9D9D9)),
                color: Colors.white,
              ),
              child: ClipOval(
                child: Image.asset(
                  employee.avatar ?? 'assets/images/profile.png',
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(width: 24),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Hiển thị tên nhân viên, nếu quá dài sẽ hiển thị dấu "..."
                  Text(
                    employee.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF1A1A1A),
                    ),
                  ),
                  const SizedBox(height: 4),
                  //
                  Text(
                    employee.email,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFF7A7A7A),
                    ),
                  ),
                  const SizedBox(height: 2),
                  // Hiển thị phòng ban, nếu không có sẽ hiển thị dấu "-"
                  Text(
                    employee.department ?? '-',
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFF7A7A7A),
                    ),
                  ),
                  const SizedBox(height: 4),
                  // Hiển thị trạng thái, nếu không có sẽ hiển thị dấu "-"
                  Text(
                    employee.status?.displayName ?? '-',
                    style: TextStyle(
                      fontSize: 13,
                      color: employee.status?.color ?? const Color(0xFF7A7A7A),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
