import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/core/utils/time_convert.dart';

import '../../../../core/widget/search_box.dart';
import '../../../account/domain/entities/candidate.dart';
import '../../domain/entities/job_application.dart';
import '../providers/job_application_list_provider.dart';

class JobApplicationListScreen extends ConsumerStatefulWidget {
  const JobApplicationListScreen({super.key});

  @override
  ConsumerState<JobApplicationListScreen> createState() =>
      _JobApplicationListScreenState();
}

class _JobApplicationListScreenState
    extends ConsumerState<JobApplicationListScreen> {
  final TextEditingController searchController = TextEditingController();
  late final ScrollController _scrollController;
  String selectedStatus = 'all';

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(() {
      if (_scrollController.position.pixels >=
          _scrollController.position.maxScrollExtent - 200) {
        ref
            .read(jobApplicationListProvider.notifier)
            .loadMore(status: selectedStatus, search: searchController.text);
      }
    });
  }

  @override
  void dispose() {
    searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchApplications() {
    return ref
        .read(jobApplicationListProvider.notifier)
        .fetchApplications(
          status: selectedStatus,
          search: searchController.text,
        );
  }

  Future<void> _refreshApplications() {
    return ref
        .read(jobApplicationListProvider.notifier)
        .refresh(status: selectedStatus, search: searchController.text);
  }

  @override
  Widget build(BuildContext context) {
    final applicationAsync = ref.watch(jobApplicationListProvider);

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
        title: const Text(
          'Danh sách ứng tuyển',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        titleSpacing: 0,
        centerTitle: false,
      ),
      body: applicationAsync.when(
        data: (data) {
          return _buildContent(data);
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: error,
      ),
    );
  }

  Widget _buildContent(JobApplicationListState state) {
    return Column(
      children: [
        Container(
          color: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
          child: SearchBox(
            controller: searchController,
            hintText: 'Tìm kiếm ứng viên',
            onSearch: (_) => _fetchApplications(),
          ),
        ),

        Container(
          color: Colors.white,
          padding: const EdgeInsets.only(bottom: 10),
          child: SizedBox(
            height: 42,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              scrollDirection: Axis.horizontal,
              itemCount: _statusFilters.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final item = _statusFilters[index];
                final selected = selectedStatus == item.value;

                return ChoiceChip(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  label: Text(
                    item.label,
                    style: TextStyle(
                      fontSize: 13,
                      color: selected ? Colors.white : Colors.black87,
                    ),
                  ),
                  selected: selected,
                  showCheckmark: false,
                  onSelected: (_) async {
                    setState(() {
                      selectedStatus = item.value;
                    });
                    await _fetchApplications();
                  },
                  selectedColor: const Color(0xFF0069B4),
                  backgroundColor: const Color(0xFFEAEAEA),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                    side: BorderSide.none,
                  ),
                );
              },
            ),
          ),
        ),

        const SizedBox(height: 10),

        Expanded(
          child: state.isLoading
              ? const Center(
                  child: Text(
                    'Không có đơn ứng tuyển',
                    style: TextStyle(fontSize: 14, color: Color(0xFF7A7A7A)),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () async {
                    await _refreshApplications();
                  },
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    itemCount: state.applications.length + 1,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      if (index == state.applications.length) {
                        if (state.isLoadingMore) {
                          return const Padding(
                            padding: EdgeInsets.symmetric(vertical: 12),
                            child: Center(child: CircularProgressIndicator()),
                          );
                        }

                        return const SizedBox(height: 100);
                      }

                      final application = state.applications[index];
                      return JobApplicationCard(application: application);
                    },
                  ),
                ),
        ),
      ],
    );
  }

  Widget error(Object error, StackTrace stackTrace) {
    final errorMessage = error.toString();
    print("Error loading application list: $errorMessage");
    return Center(
      child: Text(
        errorMessage,
        style: const TextStyle(color: Colors.red, fontSize: 14),
        textAlign: TextAlign.center,
      ),
    );
  }
}

class JobApplicationCard extends StatelessWidget {
  final JobApplication application;

  const JobApplicationCard({super.key, required this.application});

  @override
  Widget build(BuildContext context) {
    final candidate = application.candidate;

    return InkWell(
      onTap: () {
        context.push('/job-application-detail/${application.id}');
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _CandidateAvatar(candidate: candidate),
            const SizedBox(width: 18),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    candidate.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF1A1A1A),
                    ),
                  ),

                  const SizedBox(height: 4),

                  Text(
                    candidate.email,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFF7A7A7A),
                    ),
                  ),

                  const SizedBox(height: 2),

                  Text(
                    '${application.position.name} | ${application.department.name}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFF7A7A7A),
                    ),
                  ),

                  const SizedBox(height: 6),

                  Row(
                    children: [
                      _StatusBadge(status: application.status),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Ứng tuyển: ${TimeConvert.convertDateTimeToString(application.appliedAt)}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF8A8A8A),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 8),

                  Row(
                    children: [
                      if (candidate.phone != null) ...[
                        const Icon(
                          Icons.phone_outlined,
                          size: 15,
                          color: Color(0xFF7A7A7A),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          candidate.phone!,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF7A7A7A),
                          ),
                        ),
                        const SizedBox(width: 12),
                      ],
                      if (candidate.cvUrl != null)
                        const Row(
                          children: [
                            Icon(
                              Icons.description_outlined,
                              size: 15,
                              color: Color(0xFF0069B4),
                            ),
                            SizedBox(width: 4),
                            Text(
                              'Có CV',
                              style: TextStyle(
                                fontSize: 12,
                                color: Color(0xFF0069B4),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                ],
              ),
            ),

            const Icon(
              Icons.arrow_forward_ios,
              size: 16,
              color: Color(0xFFB0B0B0),
            ),
          ],
        ),
      ),
    );
  }
}

class _CandidateAvatar extends StatelessWidget {
  final Candidate candidate;

  const _CandidateAvatar({required this.candidate});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 42,
      height: 42,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: const Color(0xFFD9D9D9)),
        color: Colors.white,
      ),
      child: ClipOval(
        child: Image.asset(
          candidate.avatar ?? 'assets/images/profile.png',
          width: 42,
          height: 42,
          fit: BoxFit.cover,
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final JobApplicationStatus status;

  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: status.color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status.displayName,
        style: TextStyle(
          fontSize: 12,
          color: status.color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _FilterOption {
  final String value;
  final String label;

  const _FilterOption({required this.value, required this.label});
}

final List<_FilterOption> _statusFilters = [
  const _FilterOption(value: 'all', label: 'Tất cả'),
  ...JobApplicationStatus.values.map((status) {
    return _FilterOption(value: status.key, label: status.displayName);
  }),
];
