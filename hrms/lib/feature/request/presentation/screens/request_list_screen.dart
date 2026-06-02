import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/widget/search_box.dart';
import '../../domain/entities/request.dart';
import '../providers/request_provider.dart';
import '../widgets/request_detail_sheet.dart';
import '../widgets/request_status_badge.dart';

class RequestListScreen extends ConsumerStatefulWidget {
  final String title;
  final String initialTab;
  final bool showEmployeeTabs;

  const RequestListScreen({
    super.key,
    required this.title,
    required this.initialTab,
    this.showEmployeeTabs = false,
  });

  @override
  ConsumerState<RequestListScreen> createState() => _RequestListScreenState();
}

class _RequestListScreenState extends ConsumerState<RequestListScreen> {
  late final TextEditingController _searchController;
  late final ScrollController _scrollController;
  late String _providerKey;

  @override
  void initState() {
    super.initState();
    _providerKey = widget.initialTab;
    _searchController = TextEditingController();
    _scrollController = ScrollController();
    _scrollController.addListener(() {
      if (_scrollController.position.pixels >=
          _scrollController.position.maxScrollExtent - 200) {
        ref.read(requestListProvider(_providerKey).notifier).loadMore();
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final requestState = ref.watch(requestListProvider(_providerKey));

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
          widget.title,
          style: const TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        titleSpacing: 0,
        centerTitle: false,
        actions: [
          IconButton(
            onPressed: () => _showFilterSheet(requestState),
            icon: const Icon(Icons.filter_alt_outlined, color: Colors.black),
          ),
        ],
      ),
      body: requestState.errorMessage != null && requestState.items.isEmpty
          ? _ErrorView(
              message: requestState.errorMessage!,
              onRetry: () => ref
                  .read(requestListProvider(_providerKey).notifier)
                  .refresh(),
            )
          : _buildContent(requestState),
    );
  }

  Widget _buildContent(RequestListState state) {
    if (_searchController.text != state.filter.search) {
      _searchController.text = state.filter.search;
      _searchController.selection = TextSelection.fromPosition(
        TextPosition(offset: _searchController.text.length),
      );
    }

    return Column(
      children: [
        Container(
          color: Colors.white,
          padding: const EdgeInsets.fromLTRB(10, 10, 10, 8),
          child: Column(
            children: [
              SearchBox(
                controller: _searchController,
                hintText: 'Tìm kiếm yêu cầu',
                onSearch: (value) {
                  ref
                      .read(requestListProvider(_providerKey).notifier)
                      .search(value);
                },
              ),
              if (widget.showEmployeeTabs) ...[
                const SizedBox(height: 10),
                _EmployeeTabs(
                  activeTab: state.filter.tab,
                  onChanged: (tab) {
                    setState(() => _providerKey = tab);
                  },
                ),
              ],
              const SizedBox(height: 10),
              _FilterChips(
                state: state,
                onClearStatus: () {
                  ref
                      .read(requestListProvider(_providerKey).notifier)
                      .changeStatus(null);
                },
                onClearType: () {
                  ref
                      .read(requestListProvider(_providerKey).notifier)
                      .changeType(null);
                },
              ),
            ],
          ),
        ),
        Expanded(
          child: state.isLoading && state.items.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                  onRefresh: () => ref
                      .read(requestListProvider(_providerKey).notifier)
                      .refresh(),
                  child: state.items.isEmpty
                      ? ListView(
                          physics: const AlwaysScrollableScrollPhysics(),
                          children: const [
                            SizedBox(height: 160),
                            Center(
                              child: Text(
                                'Không có yêu cầu nào',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Color(0xFF7A7A7A),
                                ),
                              ),
                            ),
                          ],
                        )
                      : ListView.separated(
                          controller: _scrollController,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 12,
                          ),
                          itemCount: state.items.length + 1,
                          separatorBuilder: (context, index) =>
                              const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            if (index == state.items.length) {
                              return _ListFooter(state: state);
                            }
                            return _RequestCard(
                              item: state.items[index],
                              onTap: () => _openDetail(state.items[index]),
                            );
                          },
                        ),
                ),
        ),
      ],
    );
  }

  void _openDetail(RequestItem request) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useRootNavigator: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return RequestDetailSheet(
          requestId: request.id,
          listProviderKey: _providerKey,
        );
      },
    );
  }

  Future<void> _showFilterSheet(RequestListState? state) async {
    if (state == null) return;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
      ),
      builder: (context) {
        final maxHeight = MediaQuery.of(context).size.height * 0.82;

        return SafeArea(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxHeight: maxHeight),
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'Bộ lọc',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
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
                  const Text(
                    'Trạng thái',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _FilterChoice(
                        label: 'Tất cả',
                        selected: state.filter.status == null,
                        onTap: () {
                          Navigator.pop(context);
                          ref
                              .read(requestListProvider(_providerKey).notifier)
                              .changeStatus(null);
                        },
                      ),
                      ...RequestStatus.values.map((status) {
                        return _FilterChoice(
                          label: status.displayName,
                          selected: state.filter.status == status,
                          onTap: () {
                            Navigator.pop(context);
                            ref
                                .read(
                                  requestListProvider(_providerKey).notifier,
                                )
                                .changeStatus(status);
                          },
                        );
                      }),
                    ],
                  ),
                  const SizedBox(height: 18),
                  const Text(
                    'Loại yêu cầu',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _FilterChoice(
                        label: 'Tất cả',
                        selected: state.filter.type == null,
                        onTap: () {
                          Navigator.pop(context);
                          ref
                              .read(requestListProvider(_providerKey).notifier)
                              .changeType(null);
                        },
                      ),
                      ...RequestType.values.map((type) {
                        return _FilterChoice(
                          label: type.displayName,
                          selected: state.filter.type == type,
                          onTap: () {
                            Navigator.pop(context);
                            ref
                                .read(
                                  requestListProvider(_providerKey).notifier,
                                )
                                .changeType(type);
                          },
                        );
                      }),
                    ],
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

class _EmployeeTabs extends StatelessWidget {
  final String activeTab;
  final ValueChanged<String> onChanged;

  const _EmployeeTabs({required this.activeTab, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    const tabs = [
      ('pending', 'Chờ tôi duyệt'),
      ('watching', 'Theo dõi'),
      ('reviewed', 'Tôi đã duyệt'),
    ];

    return Container(
      height: 42,
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: tabs.map((tab) {
          final selected = activeTab == tab.$1;
          return Expanded(
            child: InkWell(
              borderRadius: BorderRadius.circular(9),
              onTap: () => onChanged(tab.$1),
              child: Container(
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: selected ? Colors.white : Colors.transparent,
                  borderRadius: BorderRadius.circular(9),
                  boxShadow: selected
                      ? const [
                          BoxShadow(
                            color: Color(0x14000000),
                            blurRadius: 8,
                            offset: Offset(0, 2),
                          ),
                        ]
                      : null,
                ),
                child: Text(
                  tab.$2,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
                    color: selected
                        ? const Color(0xFF0069B4)
                        : const Color(0xFF667085),
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _FilterChips extends StatelessWidget {
  final RequestListState state;
  final VoidCallback onClearStatus;
  final VoidCallback onClearType;

  const _FilterChips({
    required this.state,
    required this.onClearStatus,
    required this.onClearType,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 34,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _SmallInfoChip(label: '${state.meta.total} yêu cầu'),
          if (state.filter.status != null)
            _SmallInfoChip(
              label: state.filter.status!.displayName,
              onDeleted: onClearStatus,
            ),
          if (state.filter.type != null)
            _SmallInfoChip(
              label: state.filter.type!.displayName,
              onDeleted: onClearType,
            ),
        ],
      ),
    );
  }
}

class _SmallInfoChip extends StatelessWidget {
  final String label;
  final VoidCallback? onDeleted;

  const _SmallInfoChip({required this.label, this.onDeleted});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(horizontal: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFEAF4FF),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: Color(0xFF0069B4),
            ),
          ),
          if (onDeleted != null) ...[
            const SizedBox(width: 4),
            GestureDetector(
              onTap: onDeleted,
              child: const Icon(
                Icons.close,
                size: 16,
                color: Color(0xFF0069B4),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _RequestCard extends StatelessWidget {
  final RequestItem item;
  final VoidCallback onTap;

  const _RequestCard({required this.item, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE6EEF2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    _typeIcon(item.type),
                    color: const Color(0xFF0069B4),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.title.isEmpty ? 'Yêu cầu' : item.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF1A1A1A),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.description?.isNotEmpty == true
                            ? item.description!
                            : 'Không có mô tả',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF7A7A7A),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                RequestStatusBadge(status: item.status),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _MetaChip(
                  icon: Icons.category_outlined,
                  label: item.type.displayName,
                ),
                _MetaChip(
                  icon: Icons.person_outline,
                  label: item.requester?.displayName ?? item.requesterId,
                ),
                _MetaChip(
                  icon: Icons.schedule,
                  label: _formatDate(item.createdAt),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _MetaChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF4F8FB),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 15, color: const Color(0xFF667085)),
          const SizedBox(width: 5),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 180),
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Color(0xFF4F4F4F),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterChoice extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _FilterChoice({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      showCheckmark: false,
      onSelected: (_) => onTap(),
      selectedColor: const Color(0xFFEAF4FF),
      labelStyle: TextStyle(
        color: selected ? const Color(0xFF0069B4) : const Color(0xFF4F4F4F),
        fontWeight: FontWeight.w700,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(999),
        side: BorderSide(
          color: selected ? const Color(0xFF0069B4) : const Color(0xFFE3E3E3),
        ),
      ),
    );
  }
}

class _ListFooter extends StatelessWidget {
  final RequestListState state;

  const _ListFooter({required this.state});

  @override
  Widget build(BuildContext context) {
    if (state.isLoadingMore) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 16),
        child: Center(child: CircularProgressIndicator()),
      );
    }
    return const SizedBox(height: 90);
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.red, fontSize: 14),
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Tải lại'),
            ),
          ],
        ),
      ),
    );
  }
}

IconData _typeIcon(RequestType type) {
  switch (type) {
    case RequestType.leave:
      return Icons.beach_access_outlined;
    case RequestType.lateEarly:
      return Icons.access_time;
    case RequestType.attendanceCorrection:
      return Icons.fact_check_outlined;
    case RequestType.overtime:
      return Icons.timer_outlined;
    case RequestType.scheduleApproval:
      return Icons.calendar_month_outlined;
    case RequestType.payrollApproval:
      return Icons.payments_outlined;
    case RequestType.bonusPenalty:
      return Icons.price_change_outlined;
    case RequestType.termination:
      return Icons.person_remove_alt_1_outlined;
  }
}

String _formatDate(DateTime? value) {
  if (value == null) return '-';
  final day = value.day.toString().padLeft(2, '0');
  final month = value.month.toString().padLeft(2, '0');
  final year = value.year.toString();
  final hour = value.hour.toString().padLeft(2, '0');
  final minute = value.minute.toString().padLeft(2, '0');
  return '$day/$month/$year $hour:$minute';
}
