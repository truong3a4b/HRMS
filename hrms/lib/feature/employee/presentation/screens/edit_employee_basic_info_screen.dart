import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/core/service/address/provine_summary.dart';
import 'package:hrms/core/widget/app_snackbar.dart';

import '../../../../core/service/address/Province.dart';
import '../../../../core/service/address/Ward.dart';
import '../../../../core/utils/time_convert.dart';
import '../../../../core/widget/app_back_button.dart';
import '../../../../core/widget/app_primary_button.dart';
import '../../../../core/service/bank/bank.dart';
import '../../../../core/widget/custom_dialog.dart';
import '../../domain/entities/basic_info_request.dart';
import '../../domain/entities/employee.dart';
import '../providers/edit_employee_provider.dart';
import '../widgets/date_picker_field.dart';
import '../widgets/normal_text_field.dart';
import '../widgets/select_field.dart';

class EditEmployeeBasicInfoScreen extends ConsumerStatefulWidget {
  final String employeeId;

  const EditEmployeeBasicInfoScreen({super.key, required this.employeeId});

  @override
  ConsumerState<EditEmployeeBasicInfoScreen> createState() =>
      _EditEmployeeBasicInfoScreenState();
}

class _EditEmployeeBasicInfoScreenState
    extends ConsumerState<EditEmployeeBasicInfoScreen> {
  late final TextEditingController emailController;
  late final TextEditingController nameController;
  late final TextEditingController phoneController;
  late final TextEditingController bankAccountController;
  late final TextEditingController addressController;

  DateTime? selectedDate;
  Bank? selectedBank;
  Gender? selectedGender;
  Province? selectedProvince;
  Ward? selectedWard;


  @override
  void initState() {
    super.initState();

    // Khởi tạo rỗng trước
    emailController = TextEditingController();
    nameController = TextEditingController();
    phoneController = TextEditingController();
    bankAccountController = TextEditingController();
    addressController = TextEditingController();

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

    nameController.text = employee.name;
    emailController.text = employee.email;
    phoneController.text = employee.phone ?? '';
    bankAccountController.text = employee.bankAccount ?? '';
    addressController.text = employee.address ?? '';

    setState(() {
      selectedDate = employee.dateOfBirth;
      selectedGender = employee.gender;
      selectedBank = employee.bank;
      selectedProvince = state.provinces.firstWhereOrNull(
            (e) => e.maTinhBNV == employee.province?.maTinhBNV,
      );
      selectedWard = selectedProvince?.wards.firstWhereOrNull(
            (e) => e.code == employee.ward?.code,
      );
    });
  }

  @override
  void dispose() {
    emailController.dispose();
    nameController.dispose();
    phoneController.dispose();
    bankAccountController.dispose();
    addressController.dispose();
    super.dispose();
  }

  bool _validateForm() {
    if (nameController.text.trim().isEmpty) {
      AppSnackbar.showError(context, 'Vui lòng nhập họ và tên');
      return false;
    }
    if (selectedDate == null) {
      AppSnackbar.showError(context, 'Vui lòng chọn ngày sinh');
      return false;
    }
    if (selectedGender == null) {
      AppSnackbar.showError(context, 'Vui lòng chọn giới tính');
      return false;
    }
    if(addressController.text.trim().isNotEmpty){
      if(selectedProvince == null){
        AppSnackbar.showError(context, 'Vui lòng chọn tỉnh');
        return false;
      }
      if(selectedWard == null){
        AppSnackbar.showError(context, 'Vui lòng chọn xã');
        return false;
      }
    }
    if(bankAccountController.text.trim().isNotEmpty && selectedBank == null){
      AppSnackbar.showError(context, 'Vui lòng chọn ngân hàng');
      return false;
    }


    return true;
  }

  void _onSave(EditEmployeeState state) async {
    if (!_validateForm()) return;

    final request = BasicInfoRequest(
        id: widget.employeeId,
        name: nameController.text.trim(),
        dateOfBirth: selectedDate!,
        gender: selectedGender?.id,
        province: selectedProvince != null ? ProvinceSummary(
          maTinhBNV: selectedProvince!.maTinhBNV,
          name: selectedProvince!.name,
        ) : null,
        ward: selectedWard != null ? Ward(
          code: selectedWard!.code,
          name: selectedWard!.name,
        ) : null,
        address: addressController.text.trim(),
        bankAccount: bankAccountController.text.trim(),
        bank: selectedBank != null ? Bank(
          id: selectedBank!.id,
          name: selectedBank!.name,
        ) : null,
    );

    final success = await ref.read(editEmployeeProvider(widget.employeeId).notifier).updateEmployeeBasicInfo(request);
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
          'Thông tin cơ bản',
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
                    controller: emailController,
                    hintText: 'Email',
                    keyboardType: TextInputType.emailAddress,
                    enabled: false,
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
                    controller:  TextEditingController(
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
                    title: "Giới tính",
                    options: state.genders,
                    value: selectedGender,
                    isSearchable: false,
                    onChanged: (gender) {
                      setState(() {
                        selectedGender = gender;
                      });
                    },
                    itemLabel: (gender) => gender.displayName,
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    "Địa chỉ",
                    style:  TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 20),

                  SelectField<Province>(
                    title: "Tỉnh",
                    options: state.provinces,
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
                    "Thông tin ngân hàng",
                    style:  TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 20),

                  SelectField<Bank>(
                    title: "Chọn ngân hàng",
                    options: state.banks,
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
