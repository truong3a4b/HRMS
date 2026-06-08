import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/time_convert.dart';
import '../../../auth/presentation/providers/user_provider.dart';
import '../../data/repo/request_repository.dart';
import '../../domain/entities/request.dart';
import '../providers/request_provider.dart';
import 'request_status_badge.dart';

class RequestDetailSheet extends ConsumerStatefulWidget {
  final String requestId;
  final String listProviderKey;

  const RequestDetailSheet({
    super.key,
    required this.requestId,
    required this.listProviderKey,
  });

  @override
  ConsumerState<RequestDetailSheet> createState() => _RequestDetailSheetState();
}

class _RequestDetailSheetState extends ConsumerState<RequestDetailSheet> {
  final TextEditingController _noteController = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final detailAsync = ref.watch(requestDetailProvider(widget.requestId));

    return SafeArea(
      child: FractionallySizedBox(
        heightFactor: 0.92,
        child: Container(
          decoration: const BoxDecoration(
            color: Color(0xFFF3F3F3),
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: detailAsync.when(
            data: _buildContent,
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, stackTrace) => Center(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Text(
                  error.toString(),
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.red, fontSize: 14),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildContent(RequestItem request) {
    final userId = ref.watch(userProvider).value?.id;
    final canCancel = request.requesterId == userId && !request.status.isFinal;
    final canDecide =
        request.approvals.any(
          (approval) =>
              approval.approverId == userId &&
              approval.status == RequestApprovalStatus.pending &&
              (request.approvalMode != ApprovalMode.sequential ||
                  approval.stepOrder == request.currentStep),
        ) &&
        !request.status.isFinal;

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.fromLTRB(16, 10, 8, 14),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 42,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFD0D5DD),
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      request.title.isEmpty ? 'Yêu cầu' : request.title,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF1A1A1A),
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  RequestStatusBadge(status: request.status),
                  _SoftChip(label: request.type.displayName),
                  _SoftChip(label: request.approvalMode.displayName),
                ],
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(12),
            children: [
              _SectionCard(
                title: 'Thông tin chung',
                children: [
                  _InfoRow(
                    label: 'Người gửi',
                    value: _userName(request.requester, request.requesterId),
                  ),
                  _InfoRow(
                    label: 'Ngày tạo',
                    value: _formatDateTime(request.createdAt),
                  ),
                  if (request.description?.isNotEmpty == true)
                    _InfoRow(label: 'Mô tả', value: request.description!),
                ],
              ),
              const SizedBox(height: 12),
              if (_hasRequestDetail(request)) ...[
                _SectionCard(
                  title: 'Chi tiết yêu cầu',
                  children: _detailRows(request),
                ),
                const SizedBox(height: 12),
              ],
              _SectionCard(
                title: 'Tiến trình duyệt',
                children: [
                  _TimelineItem(
                    title: _userName(request.requester, request.requesterId),
                    subtitle: 'Người tạo đơn',
                    trailing: 'Đã gửi',
                    date: _formatDateTime(request.createdAt),
                    color: const Color(0xFF667085),
                  ),
                  ...request.approvals.map((approval) {
                    return _TimelineItem(
                      title: _userName(approval.approver, approval.approverId),
                      subtitle: request.approvalMode == ApprovalMode.sequential
                          ? 'Bước ${approval.stepOrder}'
                          : 'Người duyệt',
                      trailing: approval.status.displayName,
                      note: approval.note,
                      date: _formatDateTime(approval.decidedAt),
                      color: _approvalColor(approval.status),
                    );
                  }),
                ],
              ),
              if (request.watchers.isNotEmpty) ...[
                const SizedBox(height: 12),
                _SectionCard(
                  title: 'Người theo dõi',
                  children: [
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: request.watchers
                          .map(
                            (watcher) => _SoftChip(
                              label: _userName(watcher.user, watcher.userId),
                            ),
                          )
                          .toList(),
                    ),
                  ],
                ),
              ],
              if (canDecide || canCancel) ...[
                const SizedBox(height: 12),
                _SectionCard(
                  title: 'Thao tác',
                  children: [
                    if (canDecide) ...[
                      TextField(
                        controller: _noteController,
                        minLines: 3,
                        maxLines: 5,
                        decoration: InputDecoration(
                          hintText: 'Ghi chú quyết định (tùy chọn)',
                          filled: true,
                          fillColor: const Color(0xFFFAFAFA),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                              color: Color(0xFFD0D5DD),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: _submitting
                                  ? null
                                  : () => _confirmDecision(
                                      request,
                                      RequestApprovalStatus.rejected,
                                    ),
                              icon: const Icon(Icons.cancel_outlined),
                              label: const Text('Từ chối'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: const Color(0xFFB42318),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: _submitting
                                  ? null
                                  : () => _confirmDecision(
                                      request,
                                      RequestApprovalStatus.approved,
                                    ),
                              icon: const Icon(Icons.check_circle_outline),
                              label: const Text('Duyệt'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF0069B4),
                                foregroundColor: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                    if (canCancel) ...[
                      if (canDecide) const SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed: _submitting
                              ? null
                              : () => _confirmCancel(request),
                          icon: const Icon(Icons.delete_outline),
                          label: const Text('Hủy yêu cầu'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFFB42318),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Future<void> _confirmDecision(
    RequestItem request,
    RequestApprovalStatus decision,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          decision == RequestApprovalStatus.approved
              ? 'Duyệt yêu cầu'
              : 'Từ chối yêu cầu',
        ),
        content: Text(
          decision == RequestApprovalStatus.approved
              ? 'Bạn có chắc chắn muốn duyệt yêu cầu này?'
              : 'Bạn có chắc chắn muốn từ chối yêu cầu này?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Đóng'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Xác nhận'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await _runAction(() {
        return ref
            .read(requestRepositoryProvider)
            .decideRequest(
              id: request.id,
              decision: decision,
              note: _noteController.text,
            );
      });
    }
  }

  Future<void> _confirmCancel(RequestItem request) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hủy yêu cầu'),
        content: const Text('Bạn có chắc chắn muốn hủy yêu cầu này?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Đóng'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFB42318),
            ),
            child: const Text('Hủy yêu cầu'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await _runAction(
        () => ref.read(requestRepositoryProvider).cancelRequest(request.id),
      );
    }
  }

  Future<void> _runAction(Future<RequestItem> Function() action) async {
    setState(() => _submitting = true);
    try {
      await action();
      ref.invalidate(requestDetailProvider(widget.requestId));
      await ref
          .read(requestListProvider(widget.listProviderKey).notifier)
          .refresh();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Cập nhật yêu cầu thành công')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _SectionCard({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: Color(0xFF1A1A1A),
            ),
          ),
          const SizedBox(height: 12),
          ...children,
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: Color(0xFF7A7A7A),
            ),
          ),
          const SizedBox(height: 3),
          Text(
            value.isEmpty ? '-' : value,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: Color(0xFF2F2F2F),
            ),
          ),
        ],
      ),
    );
  }
}

class _SoftChip extends StatelessWidget {
  final String label;

  const _SoftChip({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF4F8FB),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: Color(0xFF4F4F4F),
        ),
      ),
    );
  }
}

class _TimelineItem extends StatelessWidget {
  final String title;
  final String subtitle;
  final String trailing;
  final String? note;
  final String date;
  final Color color;

  const _TimelineItem({
    required this.title,
    required this.subtitle,
    required this.trailing,
    this.note,
    required this.date,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 10,
            height: 10,
            margin: const EdgeInsets.only(top: 5),
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    _SoftChip(label: trailing),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF7A7A7A),
                  ),
                ),
                if (date != '-') ...[
                  const SizedBox(height: 3),
                  Text(
                    date,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF98A2B3),
                    ),
                  ),
                ],
                if (note?.isNotEmpty == true) ...[
                  const SizedBox(height: 6),
                  Text(
                    'Ghi chú: $note',
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF4F4F4F),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

bool _hasRequestDetail(RequestItem request) {
  return request.leaveRequest != null ||
      request.lateEarlyRequest != null ||
      request.attendanceCorrectionRequest != null ||
      request.payrollApprovalRequest != null;
}

List<Widget> _detailRows(RequestItem request) {
  final leave = request.leaveRequest;
  if (leave != null) {
    return [
      _InfoRow(label: 'Từ ngày', value: _formatDate(leave.startDate)),
      _InfoRow(label: 'Đến ngày', value: _formatDate(leave.endDate)),
      _InfoRow(label: 'Loại nghỉ', value: _leaveTypeLabel(leave.leaveType)),
      _InfoRow(
        label: 'Ca nghỉ',
        value: leave.workShift?.displayName ?? 'Nghỉ cả ngày',
      ),
      if (leave.reason?.isNotEmpty == true)
        _InfoRow(label: 'Lý do', value: leave.reason!),
    ];
  }

  final lateEarly = request.lateEarlyRequest;
  if (lateEarly != null) {
    return [
      _InfoRow(label: 'Ngày', value: _formatDate(lateEarly.date)),
      _InfoRow(
        label: 'Loại đơn',
        value: _lateEarlyLabel(lateEarly.requestType),
      ),
      _InfoRow(
        label: 'Thời gian bắt đầu làm',
        value: _formatDateTime(lateEarly.startDate),
      ),
      _InfoRow(
        label: 'Thời gian về',
        value: _formatDateTime(lateEarly.endDate),
      ),
      _InfoRow(label: 'Ca làm', value: lateEarly.workShift?.displayName ?? '-'),
      if (lateEarly.reason?.isNotEmpty == true)
        _InfoRow(label: 'Lý do', value: lateEarly.reason!),
    ];
  }

  final attendance = request.attendanceCorrectionRequest;
  if (attendance != null) {
    return [
      _InfoRow(label: 'Ngày', value: _formatDate(attendance.attendanceDate)),
      _InfoRow(
        label: 'Số công đề xuất',
        value: attendance.addedWorkUnits ?? '-',
      ),
      _InfoRow(
        label: 'Ca làm',
        value: attendance.workShift?.displayName ?? '-',
      ),
      if (attendance.reason?.isNotEmpty == true)
        _InfoRow(label: 'Lý do', value: attendance.reason!),
    ];
  }

  final payroll = request.payrollApprovalRequest;
  if (payroll != null) {
    return [
      _InfoRow(
        label: 'Kỳ lương',
        value: payroll.periodName ?? 'Tháng ${payroll.month}/${payroll.year}',
      ),
      _InfoRow(label: 'Trạng thái kỳ', value: payroll.periodStatus ?? '-'),
      if (payroll.note?.isNotEmpty == true)
        _InfoRow(label: 'Ghi chú', value: payroll.note!),
    ];
  }

  return const [];
}

Color _approvalColor(RequestApprovalStatus status) {
  switch (status) {
    case RequestApprovalStatus.approved:
      return const Color(0xFF1F8F4D);
    case RequestApprovalStatus.rejected:
      return const Color(0xFFB42318);
    case RequestApprovalStatus.pending:
      return const Color(0xFFB26A00);
  }
}

String _userName(RequestUser? user, String fallback) =>
    user?.displayName ?? fallback;

String _formatDate(DateTime? value) =>
    TimeConvert.convertDateTimeToString(value);

String _formatDateTime(DateTime? value) {
  final formatted = TimeConvert.convertDateTimeToStringWithHour(value);
  return formatted.isEmpty ? '-' : formatted;
}

String _leaveTypeLabel(String value) {
  const labels = {
    'ANNUAL_LEAVE': 'Nghỉ phép năm',
    'SICK_LEAVE': 'Nghỉ ốm',
    'UNPAID_LEAVE': 'Nghỉ không lương',
    'MATERNITY_LEAVE': 'Nghỉ thai sản',
    'BEREAVEMENT_LEAVE': 'Nghỉ tang chế',
    'MARRIAGE_LEAVE': 'Nghỉ kết hôn',
    'COMPENSATORY_LEAVE': 'Nghỉ bù',
    'OTHER': 'Khác',
    'LATE_ARRIVAL': 'Đi muộn',
    'EARLY_LEAVE': 'Về sớm',
  };
  return labels[value] ?? value;
}

String _lateEarlyLabel(String value) {
  if (value == 'EARLY_LEAVE') return 'Về sớm';
  if (value == 'LATE_ARRIVAL') return 'Đi muộn';
  return value;
}
