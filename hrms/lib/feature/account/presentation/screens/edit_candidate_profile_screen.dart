import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/service/address/Province.dart';
import '../../../../core/service/address/Ward.dart';
import '../../../../core/service/address/provine_summary.dart';
import '../../../../core/utils/platform_file_actions.dart';
import '../../../../core/utils/time_convert.dart';
import '../../../../core/widget/app_back_button.dart';
import '../../../../core/widget/app_primary_button.dart';
import '../../../../core/widget/app_snackbar.dart';
import '../../../../core/widget/custom_dialog.dart';
import '../../../employee/domain/entities/employee.dart';
import '../../../../core/widget/date_picker_field.dart';
import '../../../../core/widget/normal_text_field.dart';
import '../../../../core/widget/select_field.dart';
import '../../domain/entities/candidate_profile_request.dart';
import '../providers/edit_candidate_profile_provider.dart';
import '../providers/profile_provider.dart';
import '../widgets/cv_picker.dart';

class EditCandidateProfileScreen extends ConsumerStatefulWidget {
  const EditCandidateProfileScreen({super.key});

  @override
  ConsumerState<EditCandidateProfileScreen> createState() =>
      _EditCandidateProfileScreenState();
}

class _EditCandidateProfileScreenState
    extends ConsumerState<EditCandidateProfileScreen> {
  late final TextEditingController emailController;
  late final TextEditingController nameController;
  late final TextEditingController phoneController;
  late final TextEditingController addressController;
  late final TextEditingController nationalityController;
  late final TextEditingController religionController;
  late final TextEditingController maritalStatusController;
  late final TextEditingController identityCardNumberController;

  DateTime? selectedDate;
  DateTime? selectedIdentityIssueDate;
  Gender? selectedGender;
  Province? selectedProvince;
  Ward? selectedWard;
  PickedCvFile? selectedCvFile;
  String? currentCvUrl;

  @override
  void initState() {
    super.initState();

    emailController = TextEditingController();
    nameController = TextEditingController();
    phoneController = TextEditingController();
    addressController = TextEditingController();
    nationalityController = TextEditingController();
    religionController = TextEditingController();
    maritalStatusController = TextEditingController();
    identityCardNumberController = TextEditingController();

    Future.microtask(() async {
      await ref.read(editCandidateProfileProvider.notifier).initialize();
      _fillForm(ref.read(editCandidateProfileProvider));
    });

    ref.listenManual<EditCandidateProfileState>(
      editCandidateProfileProvider,
      (previous, next) {
        if (next.errorMessage != null &&
            previous?.errorMessage != next.errorMessage) {
          _showErrorDialog(next.errorMessage!);
        }
      },
    );
  }

  void _fillForm(EditCandidateProfileState state) {
    final candidate = state.candidate;
    if (candidate == null) return;

    nameController.text = candidate.name;
    emailController.text = candidate.email;
    phoneController.text = candidate.phone ?? '';
    addressController.text = candidate.address ?? '';
    nationalityController.text = candidate.nationality ?? '';
    religionController.text = candidate.religion ?? '';
    maritalStatusController.text = candidate.maritalStatus ?? '';
    identityCardNumberController.text = candidate.identityCardNumber ?? '';

    setState(() {
      selectedDate = candidate.dateOfBirth;
      selectedIdentityIssueDate = candidate.identityCardIssueDate;
      selectedGender = candidate.gender;
      currentCvUrl = candidate.cvUrl;
      selectedProvince = state.provinces.firstWhereOrNull(
        (e) => e.maTinhBNV == candidate.province?.maTinhBNV,
      );
      selectedWard = selectedProvince?.wards.firstWhereOrNull(
        (e) => e.code == candidate.ward?.code,
      );
    });
  }

  @override
  void dispose() {
    emailController.dispose();
    nameController.dispose();
    phoneController.dispose();
    addressController.dispose();
    nationalityController.dispose();
    religionController.dispose();
    maritalStatusController.dispose();
    identityCardNumberController.dispose();
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
    if (addressController.text.trim().isNotEmpty) {
      if (selectedProvince == null) {
        AppSnackbar.showError(context, 'Vui lòng chọn tỉnh');
        return false;
      }
      if (selectedWard == null) {
        AppSnackbar.showError(context, 'Vui lòng chọn xã');
        return false;
      }
    }
    return true;
  }

  Future<void> _pickCv() async {
    try {
      final file = await PlatformFileActions.pickCvFile();
      if (file == null) return;
      setState(() {
        selectedCvFile = file;
      });
    } catch (_) {
      AppSnackbar.showError(context, 'Không thể chọn file CV');
    }
  }

  Future<void> _onSave(EditCandidateProfileState state) async {
    if (!_validateForm()) return;

    final request = CandidateProfileRequest(
      fullName: nameController.text.trim(),
      phone: phoneController.text.trim(),
      dateOfBirth: selectedDate,
      gender: selectedGender?.id,
      province: selectedProvince != null
          ? ProvinceSummary(
              maTinhBNV: selectedProvince!.maTinhBNV,
              name: selectedProvince!.name,
            )
          : null,
      ward: selectedWard != null
          ? Ward(code: selectedWard!.code, name: selectedWard!.name)
          : null,
      address: addressController.text.trim(),
      nationality: nationalityController.text.trim(),
      religion: religionController.text.trim(),
      maritalStatus: maritalStatusController.text.trim(),
      identityCardNumber: identityCardNumberController.text.trim(),
      identityCardIssueDate: selectedIdentityIssueDate,
      cvFile: selectedCvFile,
    );

    final success = await ref
        .read(editCandidateProfileProvider.notifier)
        .updateProfile(request);

    if (!mounted) return;
    if (success) {
      ref.invalidate(profileProvider);
      AppSnackbar.showSuccess(context, 'Cập nhật thông tin thành công');
      context.pop(true);
    } else {
      AppSnackbar.showError(context, 'Cập nhật thông tin thất bại');
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) {
        return CustomDialog(
          message: message,
          type: 'error',
          onClose: () {
            ref.read(editCandidateProfileProvider.notifier).clearError();
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(editCandidateProfileProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'Chỉnh sửa hồ sơ',
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
      body: Center(child: _buildBody(state)),
      bottomNavigationBar: state.isLoading
          ? null
          : SafeArea(
              child: Container(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
                color: Colors.white,
                child: Row(
                  children: [
                    Expanded(
                      child: SizedBox(
                        height: 50,
                        child: AppBackButton(onPressed: () => context.pop()),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: SizedBox(
                        height: 50,
                        child: AppPrimaryButton(
                          onPressed: () => _onSave(state),
                          text: 'Lưu',
                          isLoading: state.isSubmitting,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildBody(EditCandidateProfileState state) {
    if (state.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.candidate == null) {
      return const Text('Không có dữ liệu');
    }

    final cvName = selectedCvFile?.name ?? fileNameFromUrl(currentCvUrl);

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 28, 20, 120),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
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
              title: 'Giới tính',
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
            const SizedBox(height: 28),
            const Text(
              'Địa chỉ',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 16),
            SelectField<Province>(
              title: 'Tỉnh',
              options: state.provinces,
              value: selectedProvince,
              isSearchable: true,
              onChanged: (province) {
                setState(() {
                  selectedProvince = province;
                  selectedWard = null;
                });
              },
              itemLabel: (province) => province.name,
            ),
            const SizedBox(height: 16),
            SelectField<Ward>(
              title: 'Xã',
              options: selectedProvince?.wards ?? [],
              value: selectedWard,
              isSearchable: true,
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
              'Thông tin thêm',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 16),
            NormalTextField(
              controller: nationalityController,
              hintText: 'Dân tộc',
            ),
            const SizedBox(height: 16),
            NormalTextField(
              controller: religionController,
              hintText: 'Tôn giáo',
            ),
            const SizedBox(height: 16),
            NormalTextField(
              controller: maritalStatusController,
              hintText: 'Tình trạng hôn nhân',
            ),
            const SizedBox(height: 16),
            NormalTextField(
              controller: identityCardNumberController,
              hintText: 'Số CCCD/CMND',
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            DatePickerField(
              hintText: 'Ngày cấp CCCD/CMND',
              controller: TextEditingController(
                text: TimeConvert.convertDateTimeToString(
                  selectedIdentityIssueDate,
                ),
              ),
              onDateSelected: (date) {
                setState(() {
                  selectedIdentityIssueDate = date;
                });
              },
            ),
            const SizedBox(height: 28),
            const Text(
              'CV ứng tuyển',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 12),
            CvPickerTile(
              fileName: cvName,
              hasNewFile: selectedCvFile != null,
              onPick: _pickCv,
            ),
          ],
        ),
      ),
    );
  }
}


