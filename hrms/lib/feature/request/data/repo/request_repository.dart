import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/request.dart';
import '../datasources/request_remote.dart';
import '../mapper/request_mapper.dart';

class RequestRepository {
  final RequestRemote remote;

  RequestRepository(this.remote);

  Future<RequestListData> getRequests({
    required String tab,
    required int page,
    required int limit,
    String? search,
    RequestStatus? status,
    RequestType? type,
  }) async {
    final dto = await remote.getRequests(
      tab: tab,
      page: page,
      limit: limit,
      search: search,
      status: status?.apiValue,
      type: type?.apiValue,
    );
    return dto.toEntity();
  }

  Future<RequestItem> getRequestById(String id) async {
    final dto = await remote.getRequestById(id);
    return dto.toEntity();
  }

  Future<List<RequestUserOption>> getEmployeeUserOptions({
    String? currentUserId,
  }) async {
    final items = await remote.getEmployeeUserOptions();
    return items
        .map((item) {
          final user = item['user'] as Map<String, dynamic>?;
          final userId = (user?['id'] ?? item['userId']) as String?;
          if (userId == null || userId.isEmpty || userId == currentUserId) {
            return null;
          }
          final employeeId = item['employeeId'] as String? ?? '';
          final name = item['name'] as String? ?? '';
          final email =
              item['email'] as String? ?? user?['email'] as String? ?? '';
          final labelParts = [
            employeeId,
            name,
            email,
          ].where((part) => part.trim().isNotEmpty).toList();
          return RequestUserOption(id: userId, label: labelParts.join(' - '));
        })
        .whereType<RequestUserOption>()
        .toList();
  }

  Future<List<RequestWorkShift>> getMyLeaveShiftsByDate(String date) async {
    final dtos = await remote.getMyLeaveShiftsByDate(date);
    return dtos.map((dto) => dto.toEntity()).toList();
  }

  Future<List<RequestWorkShift>> getMyScheduleShiftsByDate(String date) async {
    final dtos = await remote.getMyScheduleShiftsByDate(date);
    return dtos.map((dto) => dto.toEntity()).toList();
  }

  Future<RequestItem> createLeaveRequest({
    required String title,
    required String startDate,
    required String endDate,
    required String leaveType,
    String? workShiftId,
    required String reason,
    required String approvalMode,
    required List<String> approverIds,
    required List<String> watcherIds,
  }) async {
    final dto = await remote.createLeaveRequest({
      'title': title,
      'startDate': startDate,
      'endDate': endDate,
      'leaveType': leaveType,
      if (workShiftId != null && workShiftId.isNotEmpty)
        'workShiftId': workShiftId,
      'reason': reason,
      'approvalMode': approvalMode,
      'approverIds': approverIds,
      'watcherIds': watcherIds,
    });
    return dto.toEntity();
  }

  Future<RequestItem> createAttendanceCorrectionRequest({
    required String title,
    required String attendanceDate,
    required String workShiftId,
    required String reason,
    required String approvalMode,
    required List<String> approverIds,
    required List<String> watcherIds,
  }) async {
    final dto = await remote.createAttendanceCorrectionRequest({
      'title': title,
      'attendanceDate': attendanceDate,
      'workShiftId': workShiftId,
      'reason': reason,
      'approvalMode': approvalMode,
      'approverIds': approverIds,
      'watcherIds': watcherIds,
    });
    return dto.toEntity();
  }

  Future<RequestItem> decideRequest({
    required String id,
    required RequestApprovalStatus decision,
    String? note,
  }) async {
    final dto = await remote.decideRequest(
      id: id,
      decision: decision.apiValue,
      note: note,
    );
    return dto.toEntity();
  }

  Future<RequestItem> cancelRequest(String id) async {
    final dto = await remote.cancelRequest(id);
    return dto.toEntity();
  }
}

final requestRepositoryProvider = Provider<RequestRepository>((ref) {
  final remote = ref.watch(requestRemoteProvider);
  return RequestRepository(remote);
});
