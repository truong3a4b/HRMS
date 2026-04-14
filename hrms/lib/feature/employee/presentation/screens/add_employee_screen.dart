import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/core/utils/time_convert.dart';
import 'package:hrms/core/widget/app_primary_button.dart';
import 'package:hrms/feature/employee/domain/entities/Employee.dart';
import 'package:hrms/feature/employee/presentation/widgets/normal_text_field.dart';
import 'package:hrms/feature/employee/presentation/widgets/select_field.dart';

import '../../domain/entities/Department.dart';
import '../../domain/entities/Position.dart';
import '../widgets/date_picker_field.dart';

class AddEmployeeScreen extends ConsumerStatefulWidget {
  const AddEmployeeScreen({super.key});

  @override
  ConsumerState<AddEmployeeScreen> createState() => _AddEmployeeScreenState();
}

class _AddEmployeeScreenState extends ConsumerState<AddEmployeeScreen> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController nameController = TextEditingController();
  final TextEditingController phoneController = TextEditingController();
  final TextEditingController salaryController = TextEditingController();

  DateTime? selectedDate;
  Gender? selectedGender;
  Position? selectedPosition;
  Department? selectedDepartment;
  DateTime? selectedStartDate;


  final List<Gender> genders = Gender.values;
  final List<Position> positions = [
    Position(id: '1', name: 'Nhân viên'),
    Position(id: '2', name: 'Quản lý'),
    Position(id: '3', name: 'Giám đốc'),
  ];
  final List<Department> departments = [
    Department(id: '1', name: 'Phòng Kinh Doanh'),
    Department(id: '2', name: 'Phòng Nhân Sự'),
    Department(id: '3', name: 'Phòng IT'),
  ];

  @override
  void dispose() {
    emailController.dispose();
    phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const Color primaryColor = Color(0xFF0E67A7);

    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
          onPressed: () {
            context.pop();
          },
        ),
        title: const Text(
          'Thêm mới nhân viên',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        titleSpacing: 0,
        centerTitle: false,
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, thickness: 1, color: Color(0xFFEAEAEA)),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "THÔNG TIN CHUNG",
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 20),
                    NormalTextField(
                      controller: emailController,
                      hintText: 'Email',
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 16),
                    NormalTextField(
                      controller: nameController,
                      hintText: 'Họ và tên',
                    ),

                    const SizedBox(height: 16),

                    NormalTextField(
                      controller: phoneController,
                      hintText: 'Số điện thoại',
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 16),

                    DatePickerField(
                      hintText: 'Ngày sinh',
                      controller: TextEditingController(
                        text: TimeConvert.convertDateTimeToString(selectedDate),
                      ),
                      onDateSelected: (date) {
                        setState(() {
                          selectedDate = date;
                        });
                      },
                    ),
                    const SizedBox(height: 16),

                    SelectField<Gender>(
                      title: "Chọn giới tính",
                      options: genders,
                      value: selectedGender,
                      onChanged: (gender) {
                        setState(() {
                          selectedGender = gender;
                        });
                      },
                      itemLabel: (gender) => gender.displayName,
                    ),

                    const SizedBox(height: 28),

                    const Text(
                      "THÔNG TIN CÔNG VIỆC",
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 20),

                    SelectField<Position>(
                      title: "Chọn chức danh",
                      options: positions,
                      value: selectedPosition,
                      onChanged: (position) {
                        setState(() {
                          selectedPosition = position;
                        });
                      },
                      itemLabel: (position) => position.name,
                    ),
                    const SizedBox(height: 16),
                    SelectField<Department>(
                      title: "Chọn phòng ban",
                      options: departments,
                      value: selectedDepartment,
                      onChanged: (department) {
                        setState(() {
                          selectedDepartment = department;
                        });
                      },
                      itemLabel: (department) => department.name,
                    ),
                    const SizedBox(height: 16),
                    DatePickerField(
                      hintText: 'Ngày bắt đầu làm việc',
                      controller: TextEditingController(
                        text: TimeConvert.convertDateTimeToString(selectedStartDate),
                      ),
                      onDateSelected: (date) {
                        setState(() {
                          selectedStartDate = date;
                        });
                      },
                    ),
                    const SizedBox(height: 16),
                    NormalTextField(
                      controller: salaryController,
                      hintText: 'Mức lương',
                      keyboardType: TextInputType.number,
                    ),
                  ],
                ),
              ),
            ),

          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child:  Container(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          color: Colors.white,
          child: SizedBox(
            width: double.infinity,
            height: 50,
            child: AppPrimaryButton(
              onPressed: () {
                /*todo*/
              },
              text: 'Xác nhận',
            ),
          ),
        ),
      ),
    );
  }
}

class AppDropdownField<T> extends StatelessWidget {
  final T? value;
  final String hintText;
  final List<T> items;
  final ValueChanged<T?> onChanged;

  const AppDropdownField({
    super.key,
    required this.value,
    required this.hintText,
    required this.items,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 54,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E2E2), width: 1.4),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<T>(
          value: value,
          isExpanded: true,
          icon: const Icon(
            Icons.keyboard_arrow_down_rounded,
            color: Color(0xFF0E67B2),
            size: 28,
          ),
          hint: Text(
            hintText,
            style: const TextStyle(
              fontSize: 18,
              color: Color(0xFFAAAAAA),
              fontWeight: FontWeight.w400,
            ),
          ),
          style: const TextStyle(fontSize: 18, color: Colors.black),
          items: items.map((item) {
            return DropdownMenuItem<T>(
              value: item,
              child: Text(item.toString()),
            );
          }).toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }
}
