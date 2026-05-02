import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/service/address/Province.dart';
import '../../../../core/service/address/Ward.dart';
import '../../../../core/service/address/provine_summary.dart';
import '../../../../core/utils/platform_file_actions.dart';
import '../../../../core/utils/time_convert.dart';
import '../../../../core/widget/app_primary_button.dart';
import '../../../../core/widget/app_snackbar.dart';
import '../../../candidate/domain/entities/candidate.dart';
import '../../../account/presentation/providers/edit_candidate_profile_provider.dart';
import '../../../account/presentation/widgets/cv_picker.dart';
import '../../../employee/domain/entities/employee.dart';
import '../../../../core/widget/date_picker_field.dart';
import '../../../../core/widget/normal_text_field.dart';
import '../../../../core/widget/select_field.dart';
import '../../domain/entities/apply_job_request.dart';
import '../providers/jobs/recruitment_job_action_provider.dart';

class ApplyJobBottomSheet extends ConsumerStatefulWidget {
  final String recruitmentJobId;
  const ApplyJobBottomSheet({super.key, required this.recruitmentJobId});

  @override
  ConsumerState<ApplyJobBottomSheet> createState() =>
      ApplyJobBottomSheetState();
}

class ApplyJobBottomSheetState extends ConsumerState<ApplyJobBottomSheet> {
  late final TextEditingController fullNameController;
  late final TextEditingController phoneController;
  late final TextEditingController addressController;
  late final TextEditingController coverLetterController;
  late final TextEditingController notesController;

  DateTime? selectedDateOfBirth;
  Gender? selectedGender;
  Province? selectedProvince;
  Ward? selectedWard;
  PickedCvFile? selectedCvFile;
  String? currentCvUrl;

  bool didFillProfile = false;

  @override
  void initState() {
    super.initState();

    fullNameController = TextEditingController();
    phoneController = TextEditingController();
    addressController = TextEditingController();
    coverLetterController = TextEditingController();
    notesController = TextEditingController();

    Future.microtask(() async {
      await ref.read(editCandidateProfileProvider.notifier).initialize();
    });
  }

  @override
  void dispose() {
    fullNameController.dispose();
    phoneController.dispose();
    addressController.dispose();
    coverLetterController.dispose();
    notesController.dispose();
    super.dispose();
  }

  void _fillFromProfile(Candidate candidate, List<Province> provinces) {
    if (didFillProfile) return;
    didFillProfile = true;

    fullNameController.text = candidate.name;
    phoneController.text = candidate.phone ?? '';
    addressController.text = candidate.address ?? '';

    setState(() {
      selectedDateOfBirth = candidate.dateOfBirth;
      selectedGender = candidate.gender;
      currentCvUrl = candidate.cvUrl;

      selectedProvince = provinces.firstWhereOrNull(
        (e) => e.maTinhBNV == candidate.province?.maTinhBNV,
      );

      selectedWard = selectedProvince?.wards.firstWhereOrNull(
        (e) => e.code == candidate.ward?.code,
      );
    });
  }

  bool _validateForm() {
    if (fullNameController.text.trim().isEmpty) {
      AppSnackbar.showError(context, 'Vui lòng nhập họ và tên');
      return false;
    }

    if (phoneController.text.trim().isEmpty) {
      AppSnackbar.showError(context, 'Vui lòng nhập số điện thoại');
      return false;
    }

    if (selectedDateOfBirth == null) {
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

  void _submit() async {
    if (!_validateForm()) return;
    final request = ApplyJobRequest(
      recruitmentJobId: widget.recruitmentJobId,
      fullName: fullNameController.text.trim(),
      phone: phoneController.text.trim(),
      dateOfBirth: selectedDateOfBirth,
      gender: selectedGender?.id,
      province: selectedProvince == null
          ? null
          : ProvinceSummary(
        maTinhBNV: selectedProvince!.maTinhBNV,
        name: selectedProvince!.name,
      ),
      ward: selectedWard == null
          ? null
          : Ward(code: selectedWard!.code, name: selectedWard!.name),
      address: addressController.text.trim(),
      cvFile: selectedCvFile,
      coverLetter: coverLetterController.text.trim(),
      notes: notesController.text.trim(),
    );
    final success = await ref
        .read(recruitmentJobActionProvider.notifier)
        .applyJob(request);
    if (!mounted) return;
    if (success) {
      AppSnackbar.showSuccess(
        context,
        'Ứng tuyển thành công',
      );
      context.pop(true);
    }

  }

  @override
  Widget build(BuildContext context) {
    final editProfileState = ref.watch(editCandidateProfileProvider);
    final accountState = ref.watch(recruitmentJobActionProvider);

    if (editProfileState.candidate != null &&
        editProfileState.provinces.isNotEmpty) {
      _fillFromProfile(editProfileState.candidate!, editProfileState.provinces);
    }

    final cvName = selectedCvFile?.name ?? fileNameFromUrl(currentCvUrl);

    ref.listen(recruitmentJobActionProvider, (prev, next) {
      next.whenOrNull(
        error: (err, _) {
          if (!mounted) return;

          AppSnackbar.showError(context, err.toString());
        },
      );
    });

    return DraggableScrollableSheet(
      expand: false,
      snap: false,
      initialChildSize: 0.8,
      minChildSize: 0.8,
      maxChildSize: 0.8,
      builder: (context, scrollController) {
        return Scaffold(
          resizeToAvoidBottomInset: false,
          backgroundColor: Colors.white,
          body: SafeArea(
            child: Container(
              padding: EdgeInsets.fromLTRB(
                0,
                18,
                0,
                20 + MediaQuery.of(context).viewInsets.bottom,
              ),

              child: SingleChildScrollView(
                controller: scrollController,
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 20),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 42,
                        height: 4,
                        decoration: BoxDecoration(
                          color: const Color(0xFFE2E8F0),
                          borderRadius: BorderRadius.circular(999),
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),

                    const Text(
                      'Thông tin ứng tuyển',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Kiểm tra và bổ sung thông tin trước khi gửi hồ sơ.',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF64748B),
                      ),
                    ),

                    const SizedBox(height: 20),

                    NormalTextField(
                      controller: fullNameController,
                      hintText: 'Họ và tên',
                    ),
                    const SizedBox(height: 14),

                    NormalTextField(
                      controller: phoneController,
                      hintText: 'Số điện thoại',
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 14),

                    DatePickerField(
                      hintText: 'Ngày sinh',
                      controller: TextEditingController(
                        text: TimeConvert.convertDateTimeToString(
                          selectedDateOfBirth,
                        ),
                      ),
                      lastDate: DateTime.now(),
                      onDateSelected: (date) {
                        setState(() {
                          selectedDateOfBirth = date;
                        });
                      },
                    ),
                    const SizedBox(height: 14),

                    SelectField<Gender>(
                      title: 'Giới tính',
                      options: editProfileState.genders,
                      value: selectedGender,
                      isSearchable: false,
                      onChanged: (gender) {
                        setState(() {
                          selectedGender = gender;
                        });
                      },
                      itemLabel: (gender) => gender.displayName,
                    ),

                    const SizedBox(height: 24),
                    const Text(
                      'Địa chỉ',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 14),

                    SelectField<Province>(
                      title: 'Tỉnh',
                      options: editProfileState.provinces,
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
                    const SizedBox(height: 14),

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
                    const SizedBox(height: 14),

                    NormalTextField(
                      controller: addressController,
                      hintText: 'Số nhà, tên đường',
                    ),

                    const SizedBox(height: 24),
                    const Text(
                      'CV ứng tuyển',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 12),

                    CvPickerTile(
                      fileName: cvName,
                      hasNewFile: selectedCvFile != null,
                      onPick: _pickCv,
                    ),

                    const SizedBox(height: 24),

                    NormalTextField(
                      controller: coverLetterController,
                      hintText: 'Thư giới thiệu',
                      maxLines: 4,
                    ),
                    const SizedBox(height: 14),

                    NormalTextField(
                      controller: notesController,
                      hintText: 'Ghi chú',
                      maxLines: 3,
                    ),

                    const SizedBox(height: 22),


                  ],
                ),
              ),
            ),
          ),
          bottomNavigationBar: SafeArea(
            child: Container(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
              color: Colors.white,
              child: Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 50,
                      child: OutlinedButton(
                        onPressed: () => context.pop(),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF334155),
                          side: const BorderSide(
                            color: Color(0xFFCBD5E1),
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text(
                          'Hủy',
                          style: TextStyle(fontWeight: FontWeight.w700),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: SizedBox(
                      height: 50,
                      child: AppPrimaryButton(
                        onPressed: _submit,
                        isLoading: accountState.isLoading,
                        text: 'Gửi ứng tuyển',
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
