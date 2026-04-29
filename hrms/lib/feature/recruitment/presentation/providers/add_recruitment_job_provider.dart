import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../department/domain/entities/department.dart';
import '../../../department/presentation/providers/department_list_provider.dart';
import '../../../position/domain/entities/position.dart';
import '../../../position/presentation/providers/positionListProvider.dart';
import '../../data/repo/recruitment_repo.dart';
import '../../domain/entities/recruitment_job_request.dart';

class AddRecruitmentJobState {
  final List<Position> positions;
  final List<Department> departments;
  final bool isLoading;
  final String? errorMessage;

  AddRecruitmentJobState({
    this.positions = const [],
    this.departments = const [],
    this.isLoading = false,
    this.errorMessage,
  });

  AddRecruitmentJobState copyWith({
    List<Position>? positions,
    List<Department>? departments,
    bool? isLoading,
    String? errorMessage,
  }) {
    return AddRecruitmentJobState(
      positions: positions ?? this.positions,
      departments: departments ?? this.departments,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }
}

class AddRecruitmentJobNotifier
    extends AsyncNotifier<AddRecruitmentJobState> {
  @override
  Future<AddRecruitmentJobState> build() async {
    final positions = await ref.read(positionListProvider.future);
    final departments = await ref.read(departmentListProvider.future);

    return AddRecruitmentJobState(
      positions: positions,
      departments: departments,
    );
  }

  Future<bool> addRecruitmentJob(RecruitmentJobRequest request) async {
    final current = state.value;

    state = AsyncValue.data(
      current?.copyWith(isLoading: true, errorMessage: null) ??
          AddRecruitmentJobState(isLoading: true),
    );

    try {
      final repo = ref.read(recruitmentRepositoryProvider);
      final result = await repo.createRecruitmentJob(request);

      state = AsyncValue.data(
        state.value!.copyWith(isLoading: false, errorMessage: null),
      );

      return result;
    } catch (e) {
      state = AsyncValue.data(
        state.value!.copyWith(
          isLoading: false,
          errorMessage: e.toString(),
        ),
      );
      return false;
    }
  }

  void closeDialog() {
    final current = state.value;
    if (current == null) return;

    state = AsyncValue.data(
      current.copyWith(errorMessage: null),
    );
  }
}

final addRecruitmentJobProvider =
AsyncNotifierProvider<AddRecruitmentJobNotifier, AddRecruitmentJobState>(
  AddRecruitmentJobNotifier.new,
);