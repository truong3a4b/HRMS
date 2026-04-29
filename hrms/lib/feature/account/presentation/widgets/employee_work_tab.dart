import 'package:flutter/material.dart';

import '../../../../core/utils/currency_convert.dart';
import '../../../../core/utils/time_convert.dart';
import '../../../employee/domain/entities/employee.dart';
import 'info_seaction_card.dart';

class EmployeeWorkTab extends StatelessWidget {
  final Employee employee;
  final bool canEditWorkInfo;
  final VoidCallback? onEditWorkInfo;

  const EmployeeWorkTab({
    super.key,
    required this.employee,
    this.canEditWorkInfo = false,
    this.onEditWorkInfo,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      child: InfoSectionCard(
        title: 'Thông tin công việc',
        items: [
          InfoItem(label: 'Mã nhân viên', value: employee.employeeId),
          InfoItem(label: 'Phòng ban', value: employee.department?.name ?? '-'),
          InfoItem(label: 'Chức vụ', value: employee.position?.name ?? '-'),
          InfoItem(
            label: 'Ngày vào làm',
            value: TimeConvert.convertDateTimeToString(employee.hireDate),
          ),
          InfoItem(
            label: 'Mức lương',
            value: CurrencyConvert.convertToCurrency(employee.salary),
          ),
        ],
        canEdit: canEditWorkInfo,
        onEdit: onEditWorkInfo,
      ),
    );
  }
}