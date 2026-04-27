import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../domain/entities/department.dart';
import '../providers/department_list_provider.dart';

class DepartmentListScreen extends ConsumerWidget {
  const DepartmentListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final departmentsAsync = ref.watch(departmentListProvider);

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
          'Danh sách phòng ban',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        titleSpacing: 0,
        centerTitle: false,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final success = await context.push<bool>('/add-department');

          if (success == true) {
            ref.invalidate(departmentListProvider);
          }
        },
        backgroundColor: const Color(0xFF0069B4),
        shape: const CircleBorder(),
        child: const Icon(Icons.add, color: Colors.white, size: 30),
      ),
      body: departmentsAsync.when(
        data: (departments) {
          if (departments.isEmpty) {
            return const Center(
              child: Text(
                'Chưa có phòng ban nào',
                style: TextStyle(
                  fontSize: 14,
                  color: Color(0xFF7A7A7A),
                ),
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(departmentListProvider);
              await ref.read(departmentListProvider.future);
            },
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
              itemCount: departments.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final department = departments[index];
                return DepartmentCard(department: department);
              },
            ),
          );
        },
        error: (error, stackTrace) {
          return Center(
            child: Text(
              error.toString(),
              style: const TextStyle(color: Colors.red, fontSize: 14),
              textAlign: TextAlign.center,
            ),
          );
        },
        loading: () {
          return const Center(child: CircularProgressIndicator());
        },
      ),
    );
  }
}

class DepartmentCard extends StatelessWidget {
  final Department department;

  const DepartmentCard({
    super.key,
    required this.department,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        context.push('/department-detail/${department.id}');
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              department.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: Color(0xFF1A1A1A),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Mô tả: ${department.description ?? ''}',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 13,
                height: 1.4,
                color: Color(0xFF7A7A7A),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Số lượng nhân viên: ${department.employeeCount}',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 13,
                height: 1.4,
                color: Color(0xFF7A7A7A),
              ),
            ),
          ],
        ),
      ),
    );
  }
}