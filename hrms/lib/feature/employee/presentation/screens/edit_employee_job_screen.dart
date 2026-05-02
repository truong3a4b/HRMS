import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/core/widget/app_snackbar.dart';
import 'package:hrms/feature/employee/domain/entities/job_request.dart';
import 'package:hrms/feature/position/domain/entities/position.dart';

import '../../../../core/utils/time_convert.dart';
import '../../../../core/widget/app_back_button.dart';
import '../../../../core/widget/app_primary_button.dart';
import '../../../../core/widget/custom_dialog.dart';
import '../../../department/domain/entities/department.dart';
import '../providers/edit_employee_provider.dart';
import '../../../../core/widget/date_picker_field.dart';
import '../../../../core/widget/normal_text_field.dart';
import '../../../../core/widget/select_field.dart';

class EditEmployeeJobScreen extends ConsumerStatefulWidget {
  final String employeeId;

  const EditEmployeeJobScreen({super.key, required this.employeeId});

  @override
  ConsumerState<EditEmployeeJobScreen> createState() =>
      _EditEmployeeBasicInfoScreenState();
}

class _EditEmployeeBasicInfoScreenState
    extends ConsumerState<EditEmployeeJobScreen> {
  late final TextEditingController employeeCodeController;
  late final TextEditingController salaryController;

  Position? selectedPosition;
  DateTime? selectedStartDate;
  Department? selectedDepartment;



  @override
  void initState() {
    super.initState();

    // Khởi tạo rỗng trước
    employeeCodeController = TextEditingController();
    salaryController = TextEditingController();

    Future.microtask(() async {
      await ref
          .read(editEmployeeProvider(widget.employeeId).notifier)
          .initialize();

      // Lấy state SAU KHI initialize xong
      final state = ref.read(editEmployeeProvider(widget.employeeId));
      _fillForm(state);
    });

    ref.listenManual<EditEmployeeState>(editEmployeeProvider(widget.employeeId), (previous, next) {


      if(next.errorMessage != null && previous?.errorMessage != next.errorMessage){
        showErrorDialog(next.errorMessage!);
      }

    });
  }

  void _fillForm(EditEmployeeState state) {
    final employee = state.employee;
    if (employee == null) return;

    employeeCodeController.text = employee.employeeId;
    salaryController.text = employee.salary != null ? employee.salary.toString() : '';

    setState(() {
        selectedPosition = state.positions.firstWhereOrNull((p) => p.id == employee.position?.id);
        selectedDepartment = state.departments.firstWhereOrNull((d) => d.id == employee.department?.id);
        selectedStartDate = employee.hireDate;
    });
  }

  @override
  void dispose() {
    salaryController.dispose();
    super.dispose();
  }

  bool _validateForm() {
    final salaryText = salaryController.text.trim();
    if (selectedStartDate == null) {
      AppSnackbar.showError(context, 'Vui lòng chọn ngày bắt đầu làm việc');
      return false;
    }
    if (selectedPosition == null) {
      AppSnackbar.showError(context, 'Vui lòng chọn vị trí công việc');
      return false;
    }

    if(selectedDepartment == null) {
      AppSnackbar.showError(context, 'Vui lòng chọn phòng ban');
      return false;
    }
    final salary = double.tryParse(salaryText);
    if (salary == null) {
      AppSnackbar.showError(context, 'Mức lương không hợp lệ');
      return false;
    }
    return true;
  }

  void _onSave(EditEmployeeState state) async {
    if (!_validateForm()) return;

    final request = JobRequest(
      id: widget.employeeId,
      positionId: selectedPosition!.id,
      departmentId: selectedDepartment!.id,
      salary: double.parse(salaryController.text.trim()),
      hireDate: selectedStartDate,
    );

    final success = await ref.read(editEmployeeProvider(widget.employeeId).notifier).updateEmployeeJobInfo(request);
    if(!mounted) return;
    if(success == true){
      AppSnackbar.showSuccess(context, 'Cập nhật thông tin thành công');
      context.pop(true);
    } else {
      AppSnackbar.showError(context, 'Cập nhật thông tin thất bại');
    }
  }
  void showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) {
        return CustomDialog(
          message: message,
          type: "error",
          onClose: () {
            ref.read(editEmployeeProvider(widget.employeeId).notifier).clearError();
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(editEmployeeProvider(widget.employeeId));

    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'Thông tin công việc',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        titleSpacing: 0,
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, thickness: 1, color: Color(0xFFEAEAEA)),
        ),
      ),
      body: Center(
          child: _buildBody(state)
      ),
      bottomNavigationBar: state.isLoading ? null : SafeArea(
        child:  Container(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
            color: Colors.white,
            child: Row(
                mainAxisSize:  MainAxisSize.min,
                children: [
                  Expanded(
                    child:  SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: AppBackButton(
                        onPressed: () {
                          context.pop();
                        },
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child:  SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: AppPrimaryButton(
                        onPressed: () {
                          _onSave(state);
                        },
                        text: 'Lưu',
                        isLoading: state.isSubmitting,
                      ),
                    ),
                  )
                ]
            )

        ),
      ),
    );
  }

  Widget _buildBody(EditEmployeeState state){
    if(state.isLoading ){
      return loading();
    }
    if(state.employee == null){
      return const Text('Không có dữ liệu');
    }

    return SafeArea(
      child: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 20),
                  NormalTextField(
                    controller: employeeCodeController,
                    hintText: 'Mã nhân viên',
                    enabled: false,
                  ),
                  const SizedBox(height: 16),


                  SelectField<Position>(
                    title: "Chức danh",
                    options: state.positions,
                    value: selectedPosition,
                    isSearchable: false,
                    onChanged: (position) {
                      setState(() {
                        selectedPosition = position;
                      });
                    },
                    itemLabel: (position) => position.name,
                  ),
                  const SizedBox(height: 16),


                  SelectField<Department>(
                    title: "Phòng ban",
                    options: state.departments,
                    value: selectedDepartment,
                    isSearchable: false,
                    onChanged: (department) {
                      setState(() {
                        selectedDepartment = department;
                      });
                    },
                    itemLabel: (department) => department.name,
                  ),
                  const SizedBox(height: 16),
                  DatePickerField(
                    hintText: 'Ngày vào làm',
                    controller:  TextEditingController(
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
    );
  }

  Widget error(String error) {
    return Center(
      child: Text(
        error,
        style: const TextStyle(color: Colors.red, fontSize: 14),
        textAlign: TextAlign.center,
      ),
    );
  }

  Widget loading() {
    return const Center(child: CircularProgressIndicator());
  }
}
