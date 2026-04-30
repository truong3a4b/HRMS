import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';

import '../../../../core/error/app_exception.dart';
import '../../../../core/service/address/Province.dart';
import '../../../../core/service/address/province_provider.dart';
import '../../../employee/domain/entities/employee.dart';
import '../../domain/entities/candidate.dart';
import '../../domain/entities/candidate_profile_request.dart';
import '../../data/repo/account_repo.dart';

final editCandidateProfileProvider = StateNotifierProvider.autoDispose<
    EditCandidateProfileNotifier, EditCandidateProfileState>((ref) {
  return EditCandidateProfileNotifier(
    ref: ref,
    accountRepo: ref.read(accountRepoProvider),
  );
});

class EditCandidateProfileNotifier
    extends StateNotifier<EditCandidateProfileState> {
  final Ref ref;
  final AccountRepo accountRepo;

  EditCandidateProfileNotifier({required this.ref, required this.accountRepo})
      : super(EditCandidateProfileState());

  Future<void> initialize() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final result = await Future.wait([
        accountRepo.fetchCandidateProfile(),
        ref.read(provinceProvider.future),
      ]);

      state = state.copyWith(
        candidate: result[0] as Candidate,
        provinces: result[1] as List<Province>,
        isLoading: false,
      );
    } on AppException catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.message);
    } catch (e, st) {
      debugPrint('EditCandidateProfile initialize error: $e\n$st');
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Lỗi không xác định',
      );
    }
  }

  Future<bool> updateProfile(CandidateProfileRequest request) async {
    state = state.copyWith(isSubmitting: true, errorMessage: null);
    try {
      final result = await accountRepo.updateCandidateProfile(request);
      state = state.copyWith(isSubmitting: false, isSuccess: result);
      return result;
    } on AppException catch (e) {
      state = state.copyWith(isSubmitting: false, errorMessage: e.message);
      return false;
    } catch (e, st) {
      debugPrint('EditCandidateProfile updateProfile error: $e\n$st');
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: 'Lỗi không xác định',
      );
      return false;
    }
  }

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }
}

class EditCandidateProfileState {
  final Candidate? candidate;
  final List<Province> provinces;
  final List<Gender> genders = Gender.values;
  final bool isLoading;
  final bool isSubmitting;
  final bool isSuccess;
  final String? errorMessage;

  EditCandidateProfileState({
    this.candidate,
    this.provinces = const [],
    this.isLoading = false,
    this.isSubmitting = false,
    this.isSuccess = false,
    this.errorMessage,
  });

  EditCandidateProfileState copyWith({
    Candidate? candidate,
    List<Province>? provinces,
    bool? isLoading,
    bool? isSubmitting,
    bool? isSuccess,
    String? errorMessage,
  }) {
    return EditCandidateProfileState(
      candidate: candidate ?? this.candidate,
      provinces: provinces ?? this.provinces,
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      isSuccess: isSuccess ?? this.isSuccess,
      errorMessage: errorMessage,
    );
  }
}
