import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/currency_convert.dart';
import '../../../employee/domain/entities/employee.dart';
import '../../../employee/domain/entities/employee_extra.dart';
import '../../../employee/presentation/providers/employee_extra_provider.dart';
import 'info_seaction_card.dart';

class EmployeePayrollPolicyTab extends ConsumerWidget {
  final Employee employee;
  final bool isMine;

  const EmployeePayrollPolicyTab({
    super.key,
    required this.employee,
    required this.isMine,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final query = EmployeeExtraQuery(employeeId: employee.id, isMine: isMine);
    final profileAsync = ref.watch(employeePayrollProfileProvider(query));

    return profileAsync.when(
      data: (profile) => _PolicyContent(employee: employee, profile: profile),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stackTrace) => _ErrorView(
        message: error.toString(),
        onRetry: () => ref.invalidate(employeePayrollProfileProvider(query)),
      ),
    );
  }
}

class _PolicyContent extends StatelessWidget {
  final Employee employee;
  final EmployeePayrollProfileInfo? profile;

  const _PolicyContent({required this.employee, required this.profile});

  @override
  Widget build(BuildContext context) {
    if (profile == null) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(20),
          child: Text(
            'Chưa thiết lập chính sách lương',
            style: TextStyle(fontSize: 14, color: Color(0xFF7A7A7A)),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      child: Column(
        children: [
          InfoSectionCard(
            title: 'Bảo hiểm',
            items: [
              InfoItem(
                label: 'Áp dụng',
                value: profile!.isInsuranceApplicable ? 'Có' : 'Không',
              ),
              InfoItem(
                label: 'Chính sách',
                value: profile!.insurancePolicyName ?? '-',
              ),
              InfoItem(
                label: 'Lương đóng BH',
                value: CurrencyConvert.convertToCurrency(
                  profile!.insuranceSalary ?? employee.salary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          InfoSectionCard(
            title: 'Thuế TNCN',
            items: [
              InfoItem(
                label: 'Áp dụng',
                value: profile!.isTaxApplicable ? 'Có' : 'Không',
              ),
              InfoItem(
                label: 'Chính sách',
                value: profile!.taxPolicyName ?? '-',
              ),
              InfoItem(label: 'Mã số thuế', value: profile!.taxCode ?? '-'),
              InfoItem(
                label: 'Số NPT',
                value: profile!.dependentCount.toString(),
              ),
              InfoItem(
                label: 'Giảm trừ cá nhân',
                value: CurrencyConvert.convertToCurrency(
                  profile!.personalDeduction,
                ),
              ),
              InfoItem(
                label: 'Giảm trừ/NPT',
                value: CurrencyConvert.convertToCurrency(
                  profile!.dependentDeduction,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          InfoSectionCard(
            title: 'Thưởng chuyên cần',
            items: [
              InfoItem(
                label: 'Áp dụng',
                value: profile!.isAttendanceBonusApplicable ? 'Có' : 'Không',
              ),
              InfoItem(
                label: 'Chính sách',
                value: profile!.attendanceBonusPolicyName ?? '-',
              ),
              InfoItem(
                label: 'Mức thưởng',
                value: CurrencyConvert.convertToCurrency(
                  profile!.attendanceBonusAmount,
                ),
              ),
            ],
          ),
        ],
      ),
    );
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
              style: const TextStyle(color: Colors.red, fontSize: 14),
              textAlign: TextAlign.center,
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
