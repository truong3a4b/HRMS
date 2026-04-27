import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/core/utils/time_convert.dart';
import 'package:hrms/core/widget/app_primary_button.dart';
import 'package:hrms/core/widget/app_snackbar.dart';
import 'package:hrms/feature/employee/domain/entities/employee.dart';
import 'package:hrms/feature/employee/presentation/widgets/normal_text_field.dart';
import 'package:hrms/feature/employee/presentation/widgets/select_field.dart';

import '../../../../core/service/address/Province.dart';
import '../../../../core/service/address/Ward.dart';
import '../../../../core/service/address/provine_summary.dart';
import '../../../../core/service/bank/bank.dart';
import '../../../../core/widget/custom_dialog.dart';
import '../../../department/domain/entities/department.dart';
import '../../../position/domain/position.dart';
import '../../domain/entities/add_employee_request.dart';
import '../providers/add_employee_provider.dart';
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
  final TextEditingController addressController = TextEditingController();
  final TextEditingController bankAccountController = TextEditingController();

  DateTime? selectedDate;
  Gender? selectedGender;
  Position? selectedPosition;
  Department? selectedDepartment;
  DateTime? selectedStartDate;
  Province? selectedProvince;
  Ward? selectedWard;
  Bank? selectedBank;

  @override
  void initState() {
    super.initState();
    ref.listenManual<AsyncValue<AddEmployeeState>>(addEmployeeProvider, (previous, next) {
      final previousError = previous?.value?.errorMessage;
      final currentError = next.value?.errorMessage;

      if (currentError != null && currentError != previousError) {
        showErrorDialog(currentError);
      }
    });
  }

  void showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) {
        return CustomDialog(
          message: message,
          type: "error",
          onClose: () {
            ref.read(addEmployeeProvider.notifier).closeDialog();
          },
        );
      },
    );
  }

  @override
  void dispose() {
    emailController.dispose();
    nameController.dispose();
    salaryController.dispose();
    phoneController.dispose();
    addressController.dispose();
    bankAccountController.dispose();
    super.dispose();
  }

  bool _validate() {
    final email = emailController.text.trim();
    final name = nameController.text.trim();
    final phone = phoneController.text.trim();
    final salaryText = salaryController.text.trim();

    if(email.isEmpty){
      AppSnackbar.showError(context, 'Vui lòng nhập email');
      return false;
    }

    if(name.isEmpty){
      AppSnackbar.showError(context, 'Vui lòng nhập họ và tên');
      return false;
    }
    if(phone.isEmpty){
      AppSnackbar.showError(context, 'Vui lòng nhập số điện thoại');
      return false;
    }

    final salary = double.tryParse(salaryText);
    if (salary == null) {
      AppSnackbar.showError(context, 'Mức lương không hợp lệ');
      return false;
    }
    if (selectedPosition == null ) {
      AppSnackbar.showError(context, 'Vui lòng chọn chức');
      return false;
    }
    if(selectedDepartment == null){
      AppSnackbar.showError(context, 'Vui lòng chọn phòng ban');
      return false;
    }
    if(selectedStartDate == null){
      AppSnackbar.showError(context, 'Vui lòng chọn ngày bắt đầu làm việc');
      return false;
    }

    return true;
  }

  void _submit() async {
    if (!_validate()) return;
    final request = AddEmployeeRequest(
      email: emailController.text.trim(),
      name: nameController.text.trim(),
      phone: phoneController.text.trim(),
      dateOfBirth: selectedDate,
      positionId: selectedPosition?.id,
      departmentId: selectedDepartment?.id,
      hireDate: selectedStartDate,
      salary: double.tryParse(salaryController.text.trim()),
      address: addressController.text.trim(),
      province: selectedProvince != null
          ? ProvinceSummary(
              maTinhBNV: selectedProvince!.maTinhBNV,
              name: selectedProvince!.name,
            )
          : null,
      ward: selectedWard != null
          ? Ward(code: selectedWard!.code, name: selectedWard!.name)
          : null,
      bankAccount: bankAccountController.text.trim(),
      bank: selectedBank != null
          ? Bank(id: selectedBank!.id, name: selectedBank!.name)
          : null,
      gender: selectedGender?.id,
    );

    final success = await ref
        .read(addEmployeeProvider.notifier)
        .addEmployee(request);
    if (!mounted) return;
    if (success) {
      AppSnackbar.showSuccess(context, 'Thêm nhân viên thành công');
      context.pop(success);
    } else {
      AppSnackbar.showError(context, 'Thêm nhân viên thất bại');
    }
  }

  @override
  Widget build(BuildContext context) {
    final addEmployeeAsync = ref.watch(addEmployeeProvider);
    final isLoading = addEmployeeAsync.isLoading;

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
      body: addEmployeeAsync.when(
        data: (state) => _buildContent(context, state),
        error: error,
        loading: loading,
      ),
      bottomNavigationBar: isLoading
          ? null
          : SafeArea(
              child: Container(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
                color: Colors.white,
                child: SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: AppPrimaryButton(
                    onPressed: () {
                      _submit();
                    },
                    isLoading: addEmployeeAsync.value?.isLoading ?? false,
                    text: 'Xác nhận',
                  ),
                ),
              ),
            ),
    );
  }

  Widget _buildContent(BuildContext context, AddEmployeeState state) {
    final positions = state.positions;
    final departments = state.departments;
    final genders = state.genders;
    final banks = state.banks;
    final provinces = state.provinces;

    return SafeArea(
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
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
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
                      text: TimeConvert.convertDateTimeToString(
                        selectedStartDate,
                      ),
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

                  const SizedBox(height: 28),

                  const Text(
                    "ĐỊA CHỈ",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 20),

                  SelectField<Province>(
                    title: "Tỉnh",
                    options: provinces,
                    isSearchable: true,
                    value: selectedProvince,
                    onChanged: (province) {
                      setState(() {
                        selectedProvince = province;
                      });
                    },
                    itemLabel: (province) => province.name,
                  ),

                  const SizedBox(height: 16),

                  SelectField<Ward>(
                    title: "Xã",
                    options: selectedProvince?.wards ?? [],
                    isSearchable: true,
                    value: selectedWard,
                    onChanged: (ward) {
                      setState(() {
                        selectedWard = ward;
                      });
                    },
                    itemLabel: (ward) => ward.name,
                  ),

                  const SizedBox(height: 16),

                  NormalTextField(
                    controller: addressController,
                    hintText: 'Số nhà, tên đường',
                  ),

                  const SizedBox(height: 28),
                  const Text(
                    "THÔNG TIN NGÂN HÀNG",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 20),

                  SelectField<Bank>(
                    title: "Chọn ngân hàng",
                    options: banks,
                    value: selectedBank,
                    isSearchable: true,
                    onChanged: (bank) {
                      setState(() {
                        selectedBank = bank;
                      });
                    },
                    itemLabel: (bank) => bank.name,
                  ),

                  const SizedBox(height: 16),

                  NormalTextField(
                    controller: bankAccountController,
                    hintText: 'Số tài khoản',
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

  Widget error(Object error, StackTrace stackTrace) {
    final errorMessage = error.toString();
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
