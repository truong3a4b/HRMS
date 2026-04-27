import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widget/search_box.dart';
import '../../domain/entities/employee.dart';
import '../providers/employee_list_provider.dart';
import '../widgets/employee_filter_bottom_sheet.dart';

class EmployeeListScreen extends ConsumerStatefulWidget {
  const EmployeeListScreen({super.key});

  @override
  ConsumerState<EmployeeListScreen> createState() => _EmployeeListScreenState();
}

class _EmployeeListScreenState extends ConsumerState<EmployeeListScreen> {
  FilterResult _filterResult = FilterResult({
    'department': FilterOption(value: "all", label: 'Tất cả phòng ban'),
    'position': FilterOption(value: "all", label: 'Tất cả chức vụ'),
    'status': FilterOption(value: "all", label: 'Tất cả trạng thái'),
  });
  final TextEditingController searchController = TextEditingController();
  late final ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(() {
      if (_scrollController.position.pixels >=
          _scrollController.position.maxScrollExtent - 200) {
        debugPrint('Scrolled to bottom, loading more employees...');
        ref.read(employeeListProvider.notifier).loadMore(
          filterResult: _filterResult,
          name: searchController.text,
        );
      }
    });
  }

  @override
  void dispose() {
    searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final employeeListAsync = ref.watch(employeeListProvider);
    final filters = employeeListAsync.value?.filters ?? [];
    final isLoading = employeeListAsync.isLoading;

    _filterResult = FilterResult({
      'department': _filterResult['department'] ?? filters.firstWhere((f) => f.key == 'department').options.first,
      'position': _filterResult['position'] ?? filters.firstWhere((f) => f.key == 'position').options.first,
      'status': _filterResult['status'] ?? filters.firstWhere((f) => f.key == 'status').options.first,
    });

    return Scaffold(
      backgroundColor: const Color(0xFFF3F3F3),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          onPressed: () {
            Navigator.pop(context);
          },
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
        ),
        title: const Text(
          'Danh sách nhân viên',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        titleSpacing: 0,
        centerTitle: false,
        actions: [
          IconButton(
            onPressed: isLoading
                ? null
                : () async {
              _filterResult =
                  await showModalBottomSheet<FilterResult>(
                    context: context,
                    isScrollControlled: true,
                    backgroundColor: Colors.transparent,
                    useRootNavigator: true,
                    builder: (context) {
                      return EmployeeFilterBottomSheet(
                        filters: filters,
                        filterResult: _filterResult,
                        onApply: (result) {
                          Navigator.pop(context, result);
                          ref
                              .read(employeeListProvider.notifier)
                              .fetchEmployees(
                            filterResult: result,
                            name: searchController.text.isEmpty
                                ? null
                                : searchController.text,
                          );
                        },
                      );
                    },
                  ) ??
                      _filterResult;
              setState(() {});
            },
            icon: const Icon(Icons.filter_alt_outlined, color: Colors.black),
          )
        ],
      ),
      //nut them moi nhan vien
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final success = await context.push<bool>('/add-employee');
          if(success == true) {
            ref.read(employeeListProvider.notifier).refresh(
              filterResult: _filterResult,
              name: searchController.text.isEmpty ? null : searchController.text,
            );
          }
        },
        backgroundColor: const Color(0xFF0069B4),
        shape: const CircleBorder(),
        child: const Icon(Icons.add, color: Colors.white, size: 30),
      ),
      body: employeeListAsync.when(
        data: (employeeListState) => _buildContent(context, employeeListState),
        error: error,
        loading: loading,
      ),
    );
  }

  Widget _buildContent(BuildContext context, EmployeeListState state) {
    return Column(
      children: [
        //search box
        Container(
          color: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
          child: SearchBox(
            controller: searchController,
            hintText: 'Tìm kiếm nhân viên',
            onSearch: (value) {
              ref.read(employeeListProvider.notifier).fetchEmployees(
                    filterResult: _filterResult,
                    name: value.isEmpty ? null : value,
                  );
            },
          ),
        ),

        Container(
          color: Colors.white,
          padding: const EdgeInsets.only(bottom: 10),
          //list filter
          child: SizedBox(
            height: 42,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              scrollDirection: Axis.horizontal,
              itemCount: state.filters.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final filter = state.filters[index];
                return ChoiceChip(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  label: Text(
                    _filterResult[filter.key]?.label ??
                        filter.options.first.label,
                    style: TextStyle(fontSize: 13),
                  ),
                  selected: false,
                  showCheckmark: false,
                  onSelected: (_) {},
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
          child: RefreshIndicator(
            onRefresh: () async {
              await ref
                  .read(employeeListProvider.notifier)
                  .refresh(
                    filterResult: _filterResult,
                    name: searchController.text.isEmpty
                        ? null
                        : searchController.text,
                  );
            },
            child: state.isLoading
                ? Center(child: CircularProgressIndicator())
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    itemCount: state.employees.length+1,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      if(index == state.employees.length) {
                        if(state.isLoadingMore) {
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            child: Center(child: CircularProgressIndicator()),
                          );
                        } else {
                          return SizedBox(
                            height: 100,
                          );
                        }
                      }
                      final employee = state.employees[index];
                      return EmployeeCard(employee: employee);
                    },
                  ),
          ),
        ),
      ],
    );
  }

  Widget error(Object error, StackTrace stackTrace) {
    final errorMessage = error.toString();
    print("Error loading employee list: $errorMessage");
    return Center(
      child: Text(
        errorMessage,
        style: const TextStyle(color: Colors.red, fontSize: 14),
        textAlign: TextAlign.center,
      ),
    );
  }

  Widget loading() {
    return const Center(child: CircularProgressIndicator());
  }
}

// Widget hiển thị thông tin nhân viên trong danh sách
class EmployeeCard extends StatelessWidget {
  final Employee employee;

  const EmployeeCard({super.key, required this.employee});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        context.push('/employee-detail/${employee.id}');
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
            Container(
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
                  employee.avatar ?? 'assets/images/profile.png',
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(width: 24),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Hiển thị tên nhân viên, nếu quá dài sẽ hiển thị dấu "..."
                  Text(
                    employee.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF1A1A1A),
                    ),
                  ),
                  const SizedBox(height: 4),
                  //
                  Text(
                    employee.email,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFF7A7A7A),
                    ),
                  ),
                  const SizedBox(height: 2),
                  // Hiển thị chức vụ và phòng ban, nếu không có sẽ hiển thị dấu "-"
                  Text(
                    '${employee.position?.name ?? '-'} | ${employee.department?.name ?? '-'}',
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFF7A7A7A),
                    ),
                  ),
                  const SizedBox(height: 4),
                  // Hiển thị trạng thái, nếu không có sẽ hiển thị dấu "-"
                  Text(
                    employee.status?.displayName ?? '-',
                    style: TextStyle(
                      fontSize: 13,
                      color: employee.status?.color ?? const Color(0xFF7A7A7A),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
