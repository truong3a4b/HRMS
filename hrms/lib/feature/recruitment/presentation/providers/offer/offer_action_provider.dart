import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';

import '../../../data/repo/recruitment_repo.dart';

final offerActionProvider =
AsyncNotifierProvider<OfferActionNotifier, void>(
  OfferActionNotifier.new,
);

class OfferActionNotifier extends AsyncNotifier<void> {
  @override
  Future<void> build() async {}

  /// Gửi offer cho ứng viên
  Future<bool> sendOffer(Map<String, dynamic> data) async {
    try{
      state = const AsyncLoading();
      final repo = ref.read(recruitmentRepositoryProvider);

      final applicationId = data['jobApplicationId'];
      if (applicationId == null) {
        throw AppException('Thiếu jobApplicationId trong request');
      }

      await repo.sendOffer(applicationId, data);
      state = const AsyncData(null);
      return true;
    } on AppException catch (e, st) {
      state = AsyncValue.error(e.message, st);
      return false;
    } catch (e, st) {
      debugPrint('OfferActionNotifier sendOffer error: $e');
      debugPrint('Stack trace: $st');
      state = AsyncValue.error('Lỗi khi gửi offer', st);
      return false;
    }

  }

  // Ứng viên phản hồi offer (chấp nhận hoặc từ chối)
  Future<bool> respondOffer(Map<String, dynamic> data) async {
    try {
      state = const AsyncLoading();
      final repo = ref.read(recruitmentRepositoryProvider);

      final applicationId = data['jobApplicationId'];
      if (applicationId == null) {
        throw AppException('Thiếu jobApplicationId trong request');
      }

      await repo.respondOffer(applicationId, data);
      state = const AsyncData(null);
      return true;
    } on AppException catch (e, st) {
      state = AsyncValue.error(e.message, st);
      return false;
    } catch (e, st) {
      debugPrint('OfferActionNotifier respondOffer error: $e');
      debugPrint('Stack trace: $st');
      state = AsyncValue.error('Lỗi khi phản hồi offer', st);
      return false;
    }
  }

}
