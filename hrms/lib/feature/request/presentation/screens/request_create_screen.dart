import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/providers/user_provider.dart';
import '../../data/repo/request_repository.dart';
import '../../domain/entities/request.dart';
import '../providers/request_provider.dart';

enum RequestCreateKind { leave, attendanceCorrection }

class RequestCreateScreen extends ConsumerStatefulWidget {
  final RequestCreateKind kind;

  const RequestCreateScreen({super.key, required this.kind});

  @override
  ConsumerState<RequestCreateScreen> createState() =>
      _RequestCreateScreenState();
}

class _RequestCreateScreenState extends ConsumerState<RequestCreateScreen> {
  final _titleController = TextEditingController();
  final _reasonController = TextEditingController();
  final _approverSearchController = TextEditingController();
  final _watcherSearchController = TextEditingController();

  DateTime? _startDate;
  DateTime? _endDate;
  DateTime? _attendanceDate;
  String _leaveType = 'ANNUAL_LEAVE';
  String _approvalMode = 'PARALLEL';
  RequestWorkShift? _selectedLeaveShift;
  RequestWorkShift? _selectedAttendanceShift;
  List<RequestWorkShift> _leaveShifts = const [];
  List<RequestWorkShift> _attendanceShifts = const [];
  List<RequestUserOption> _userOptions = const [];
  final Set<String> _approverIds = {};
  final Set<String> _watcherIds = {};
  bool _isLoadingOptions = true;
  bool _isLoadingShifts = false;
  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    Future.microtask(_loadOptions);
  }

  @override
  void dispose() {
    _titleController.dispose();
    _reasonController.dispose();
    _approverSearchController.dispose();
    _watcherSearchController.dispose();
    super.dispose();
  }

  bool get _isLeave => widget.kind == RequestCreateKind.leave;

  @override
  Widget build(BuildContext context) {
    final title = _isLeave ? 'Xin nghỉ phép' : 'Đề xuất cộng công';

    return Scaffold(
      backgroundColor: const Color(0xFFF3F3F3),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
        ),
        title: Text(
          title,
          style: const TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        titleSpacing: 0,
      ),
      body: SafeArea(
        child: _isLoadingOptions
            ? const Center(child: CircularProgressIndicator())
            : Column(
                children: [
                  Expanded(
                    child: ListView(
                      padding: const EdgeInsets.all(12),
                      children: [
                        if (_errorMessage != null) ...[
                          _ErrorBanner(message: _errorMessage!),
                          const SizedBox(height: 12),
                        ],
                        _SectionCard(
                          children: [
                            _TextInput(
                              controller: _titleController,
                              label: 'Tiêu đề *',
                              hintText: _isLeave
                                  ? 'Nhập tiêu đề đơn nghỉ phép'
                                  : 'Nhập tiêu đề đề xuất cộng công',
                            ),
                            const SizedBox(height: 12),
                            if (_isLeave)
                              ..._buildLeaveFields()
                            else
                              ..._buildAttendanceFields(),
                            const SizedBox(height: 12),
                            _TextInput(
                              controller: _reasonController,
                              label: 'Lý do *',
                              hintText: _isLeave
                                  ? 'Nhập lý do nghỉ phép'
                                  : 'Nhập lý do cộng công',
                              maxLines: 3,
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        _SectionCard(
                          children: [
                            _SelectTile<String>(
                              label: 'Cách duyệt',
                              valueLabel: _approvalMode == 'PARALLEL'
                                  ? 'Duyệt song song'
                                  : 'Duyệt tuần tự',
                              onTap: () => _showSingleSelect<String>(
                                title: 'Cách duyệt',
                                items: const ['PARALLEL', 'SEQUENTIAL'],
                                labelBuilder: (item) => item == 'PARALLEL'
                                    ? 'Duyệt song song'
                                    : 'Duyệt tuần tự',
                                onSelected: (value) {
                                  setState(() => _approvalMode = value);
                                },
                              ),
                            ),
                            const SizedBox(height: 12),
                            _MultiUserSelector(
                              title: 'Người duyệt *',
                              options: _userOptions,
                              selectedIds: _approverIds,
                              searchController: _approverSearchController,
                              onChanged: () => setState(() {}),
                            ),
                            const SizedBox(height: 12),
                            _MultiUserSelector(
                              title: 'Người theo dõi',
                              options: _userOptions,
                              selectedIds: _watcherIds,
                              searchController: _watcherSearchController,
                              onChanged: () => setState(() {}),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
                    color: Colors.white,
                    child: SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton.icon(
                        onPressed: _isSubmitting ? null : _submit,
                        icon: const Icon(Icons.send_outlined),
                        label: Text(
                          _isSubmitting ? 'Đang gửi...' : 'Gửi duyệt',
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0069B4),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  List<Widget> _buildLeaveFields() {
    return [
      _SelectTile<String>(
        label: 'Loại nghỉ *',
        valueLabel: _leaveTypeLabel(_leaveType),
        onTap: () => _showSingleSelect<String>(
          title: 'Loại nghỉ',
          items: _leaveTypes,
          labelBuilder: _leaveTypeLabel,
          onSelected: (value) => setState(() => _leaveType = value),
        ),
      ),
      const SizedBox(height: 12),
      _DateTile(
        label: 'Ngày bắt đầu *',
        value: _startDate,
        onTap: () async {
          final picked = await _pickDate(initialDate: _startDate);
          if (picked == null) return;
          setState(() {
            _startDate = picked;
            if (_endDate == null || _endDate!.isBefore(picked)) {
              _endDate = picked;
            }
            _selectedLeaveShift = null;
          });
          await _loadLeaveShifts(picked);
        },
      ),
      const SizedBox(height: 12),
      _DateTile(
        label: 'Ngày kết thúc *',
        value: _endDate,
        onTap: () async {
          final picked = await _pickDate(initialDate: _endDate ?? _startDate);
          if (picked == null) return;
          setState(() => _endDate = picked);
        },
      ),
      const SizedBox(height: 12),
      _SelectTile<RequestWorkShift?>(
        label: 'Ca nghỉ',
        valueLabel: _isLoadingShifts
            ? 'Đang tải ca...'
            : _selectedLeaveShift?.displayName ?? 'Nghỉ cả ngày',
        onTap: _startDate == null || _isLoadingShifts
            ? null
            : _showLeaveShiftSelect,
      ),
    ];
  }

  List<Widget> _buildAttendanceFields() {
    return [
      _DateTile(
        label: 'Ngày cộng công *',
        value: _attendanceDate,
        onTap: () async {
          final picked = await _pickDate(initialDate: _attendanceDate);
          if (picked == null) return;
          setState(() {
            _attendanceDate = picked;
            _selectedAttendanceShift = null;
          });
          await _loadAttendanceShifts(picked);
        },
      ),
      const SizedBox(height: 12),
      _SelectTile<RequestWorkShift>(
        label: 'Ca làm *',
        valueLabel: _isLoadingShifts
            ? 'Đang tải ca...'
            : _selectedAttendanceShift?.displayName ?? 'Chọn ca làm',
        onTap: _attendanceDate == null || _isLoadingShifts
            ? null
            : () => _showSingleSelect<RequestWorkShift>(
                title: 'Ca làm',
                items: _attendanceShifts,
                labelBuilder: (item) => item.displayName,
                onSelected: (value) {
                  setState(() => _selectedAttendanceShift = value);
                },
              ),
      ),
    ];
  }

  Future<void> _loadOptions() async {
    setState(() {
      _isLoadingOptions = true;
      _errorMessage = null;
    });
    try {
      final currentUserId = ref.read(userProvider).value?.id;
      final options = await ref
          .read(requestRepositoryProvider)
          .getEmployeeUserOptions(currentUserId: currentUserId);
      if (!mounted) return;
      setState(() => _userOptions = options);
    } catch (e) {
      if (!mounted) return;
      setState(() => _errorMessage = e.toString());
    } finally {
      if (mounted) setState(() => _isLoadingOptions = false);
    }
  }

  Future<void> _loadLeaveShifts(DateTime date) async {
    await _loadShifts(() async {
      final shifts = await ref
          .read(requestRepositoryProvider)
          .getMyLeaveShiftsByDate(_apiDate(date));
      setState(() => _leaveShifts = shifts);
    });
  }

  Future<void> _loadAttendanceShifts(DateTime date) async {
    await _loadShifts(() async {
      final shifts = await ref
          .read(requestRepositoryProvider)
          .getMyScheduleShiftsByDate(_apiDate(date));
      setState(() => _attendanceShifts = shifts);
    });
  }

  Future<void> _loadShifts(Future<void> Function() loader) async {
    setState(() {
      _isLoadingShifts = true;
      _errorMessage = null;
    });
    try {
      await loader();
    } catch (e) {
      if (!mounted) return;
      setState(() => _errorMessage = e.toString());
    } finally {
      if (mounted) setState(() => _isLoadingShifts = false);
    }
  }

  Future<void> _submit() async {
    final validationError = _validate();
    if (validationError != null) {
      setState(() => _errorMessage = validationError);
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      final repo = ref.read(requestRepositoryProvider);
      if (_isLeave) {
        await repo.createLeaveRequest(
          title: _titleController.text.trim(),
          startDate: _apiDate(_startDate!),
          endDate: _apiDate(_endDate!),
          leaveType: _leaveType,
          workShiftId: _selectedLeaveShift?.id,
          reason: _reasonController.text.trim(),
          approvalMode: _approvalMode,
          approverIds: _approverIds.toList(),
          watcherIds: _watcherIds.toList(),
        );
      } else {
        await repo.createAttendanceCorrectionRequest(
          title: _titleController.text.trim(),
          attendanceDate: _apiDate(_attendanceDate!),
          workShiftId: _selectedAttendanceShift!.id,
          reason: _reasonController.text.trim(),
          approvalMode: _approvalMode,
          approverIds: _approverIds.toList(),
          watcherIds: _watcherIds.toList(),
        );
      }

      ref.invalidate(requestDetailProvider);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Gửi yêu cầu thành công')));
        context.go('/my-requests');
      }
    } catch (e) {
      if (mounted) setState(() => _errorMessage = e.toString());
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  String? _validate() {
    if (_titleController.text.trim().length < 2) {
      return 'Vui lòng nhập tiêu đề yêu cầu';
    }
    if (_approverIds.isEmpty) {
      return 'Vui lòng chọn ít nhất một người duyệt';
    }
    if (_reasonController.text.trim().length < 2) {
      return 'Vui lòng nhập lý do';
    }
    if (_isLeave) {
      if (_startDate == null || _endDate == null) {
        return 'Vui lòng chọn thời gian nghỉ phép';
      }
      if (_endDate!.isBefore(_startDate!)) {
        return 'Ngày kết thúc không được trước ngày bắt đầu';
      }
    } else {
      if (_attendanceDate == null) {
        return 'Vui lòng chọn ngày cần cộng công';
      }
      if (_selectedAttendanceShift == null) {
        return 'Vui lòng chọn ca làm cần cộng công';
      }
    }
    return null;
  }

  Future<DateTime?> _pickDate({DateTime? initialDate}) {
    final now = DateTime.now();
    return showDatePicker(
      context: context,
      initialDate: initialDate ?? now,
      firstDate: DateTime(now.year - 2),
      lastDate: DateTime(now.year + 2),
    );
  }

  Future<void> _showSingleSelect<T>({
    required String title,
    required List<T> items,
    required String Function(T item) labelBuilder,
    required ValueChanged<T> onSelected,
  }) async {
    if (items.isEmpty) return;
    final selected = await showModalBottomSheet<T>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxHeight: MediaQuery.of(context).size.height * 0.75,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 14, 8, 8),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          title,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.close),
                      ),
                    ],
                  ),
                ),
                Flexible(
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: items.length,
                    separatorBuilder: (context, index) =>
                        const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final item = items[index];
                      return ListTile(
                        title: Text(labelBuilder(item)),
                        onTap: () => Navigator.pop(context, item),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
    if (selected != null) {
      onSelected(selected as T);
    }
  }

  Future<void> _showLeaveShiftSelect() async {
    final selected = await showModalBottomSheet<RequestWorkShift?>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxHeight: MediaQuery.of(context).size.height * 0.75,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 14, 8, 8),
                  child: Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'Ca nghỉ',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.close),
                      ),
                    ],
                  ),
                ),
                Flexible(
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: _leaveShifts.length + 1,
                    separatorBuilder: (context, index) =>
                        const Divider(height: 1),
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        return ListTile(
                          title: const Text('Nghỉ cả ngày'),
                          onTap: () => Navigator.pop(context, null),
                        );
                      }
                      final shift = _leaveShifts[index - 1];
                      return ListTile(
                        title: Text(shift.displayName),
                        onTap: () => Navigator.pop(context, shift),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );

    setState(() => _selectedLeaveShift = selected);
  }
}

class _SectionCard extends StatelessWidget {
  final List<Widget> children;

  const _SectionCard({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(children: children),
    );
  }
}

class _TextInput extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String hintText;
  final int maxLines;

  const _TextInput({
    required this.controller,
    required this.label,
    required this.hintText,
    this.maxLines = 1,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      decoration: InputDecoration(
        labelText: label,
        hintText: hintText,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFD8D8D8)),
        ),
      ),
    );
  }
}

class _DateTile extends StatelessWidget {
  final String label;
  final DateTime? value;
  final VoidCallback onTap;

  const _DateTile({
    required this.label,
    required this.value,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return _SelectTile<DateTime>(
      label: label,
      valueLabel: value == null ? 'Chọn ngày' : _displayDate(value!),
      onTap: onTap,
    );
  }
}

class _SelectTile<T> extends StatelessWidget {
  final String label;
  final String valueLabel;
  final VoidCallback? onTap;

  const _SelectTile({
    required this.label,
    required this.valueLabel,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: label,
          filled: true,
          fillColor: onTap == null ? const Color(0xFFF5F5F5) : Colors.white,
          suffixIcon: Icon(
            Icons.keyboard_arrow_down_rounded,
            color: onTap == null
                ? const Color(0xFFB0B0B0)
                : const Color(0xFF0E67B2),
          ),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFD8D8D8)),
          ),
        ),
        child: Text(
          valueLabel,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            fontSize: 15,
            color: onTap == null ? const Color(0xFF9E9E9E) : Colors.black,
          ),
        ),
      ),
    );
  }
}

class _MultiUserSelector extends StatelessWidget {
  final String title;
  final List<RequestUserOption> options;
  final Set<String> selectedIds;
  final TextEditingController searchController;
  final VoidCallback onChanged;

  const _MultiUserSelector({
    required this.title,
    required this.options,
    required this.selectedIds,
    required this.searchController,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final selectedLabels = options
        .where((option) => selectedIds.contains(option.id))
        .map((option) => option.label)
        .toList();

    return InkWell(
      onTap: () => _showPicker(context),
      borderRadius: BorderRadius.circular(12),
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: title,
          filled: true,
          fillColor: Colors.white,
          suffixIcon: const Icon(Icons.keyboard_arrow_down_rounded),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFD8D8D8)),
          ),
        ),
        child: Text(
          selectedLabels.isEmpty
              ? 'Chọn người'
              : 'Đã chọn ${selectedLabels.length} người',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ),
    );
  }

  void _showPicker(BuildContext context) {
    searchController.clear();
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return _UserPickerSheet(
          title: title,
          options: options,
          selectedIds: selectedIds,
          searchController: searchController,
          onChanged: onChanged,
        );
      },
    );
  }
}

class _UserPickerSheet extends StatefulWidget {
  final String title;
  final List<RequestUserOption> options;
  final Set<String> selectedIds;
  final TextEditingController searchController;
  final VoidCallback onChanged;

  const _UserPickerSheet({
    required this.title,
    required this.options,
    required this.selectedIds,
    required this.searchController,
    required this.onChanged,
  });

  @override
  State<_UserPickerSheet> createState() => _UserPickerSheetState();
}

class _UserPickerSheetState extends State<_UserPickerSheet> {
  String _keyword = '';

  @override
  Widget build(BuildContext context) {
    final filtered = widget.options
        .where(
          (option) =>
              option.label.toLowerCase().contains(_keyword.toLowerCase()),
        )
        .toList();

    return SafeArea(
      child: FractionallySizedBox(
        heightFactor: 0.82,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 8, 8),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      widget.title,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Xong'),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
              child: TextField(
                controller: widget.searchController,
                onChanged: (value) => setState(() => _keyword = value),
                decoration: InputDecoration(
                  hintText: 'Tìm kiếm...',
                  prefixIcon: const Icon(Icons.search),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
            Expanded(
              child: ListView.separated(
                itemCount: filtered.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final option = filtered[index];
                  final selected = widget.selectedIds.contains(option.id);
                  return CheckboxListTile(
                    value: selected,
                    title: Text(option.label),
                    controlAffinity: ListTileControlAffinity.leading,
                    onChanged: (_) {
                      setState(() {
                        if (selected) {
                          widget.selectedIds.remove(option.id);
                        } else {
                          widget.selectedIds.add(option.id);
                        }
                      });
                      widget.onChanged();
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  final String message;

  const _ErrorBanner({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBFA),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFFECDCA)),
      ),
      child: Text(
        message,
        style: const TextStyle(
          color: Color(0xFFB42318),
          fontSize: 13,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

const _leaveTypes = [
  'ANNUAL_LEAVE',
  'SICK_LEAVE',
  'UNPAID_LEAVE',
  'MATERNITY_LEAVE',
  'BEREAVEMENT_LEAVE',
  'MARRIAGE_LEAVE',
  'COMPENSATORY_LEAVE',
  'OTHER',
];

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
  };
  return labels[value] ?? value;
}

String _displayDate(DateTime date) {
  final day = date.day.toString().padLeft(2, '0');
  final month = date.month.toString().padLeft(2, '0');
  return '$day/$month/${date.year}';
}

String _apiDate(DateTime date) {
  final month = date.month.toString().padLeft(2, '0');
  final day = date.day.toString().padLeft(2, '0');
  return '${date.year}-$month-$day';
}
