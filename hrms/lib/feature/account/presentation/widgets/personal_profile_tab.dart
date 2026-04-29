import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/time_convert.dart';
import '../../../employee/domain/entities/employee.dart';
import '../../domain/entities/profile.dart';
import 'info_seaction_card.dart';

class ProfilePersonalTab extends ConsumerWidget {
  final Profile profile;
  final bool canEditBasicInfo;
  final bool canEditAdditionalInfo;
  final VoidCallback? onEditBasicInfo;
  final VoidCallback? onEditAdditionalInfo;

  const ProfilePersonalTab({
    super.key,
    required this.profile,
    this.canEditBasicInfo = false,
    this.canEditAdditionalInfo = false,
    this.onEditBasicInfo,
    this.onEditAdditionalInfo,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final parts = [
      profile.address,
      profile.ward?.name,
      profile.province?.name,
    ];

    final fullAddress = parts
        .where((e) => e != null && e.trim().isNotEmpty)
        .join(', ');

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      child: Column(
        children: [
          InfoSectionCard(
            title: 'Thông tin cơ bản',
            items: [
              InfoItem(label: 'Họ tên', value: profile.name),
              InfoItem(label: 'Email', value: profile.email),
              InfoItem(label: 'Số điện thoại', value: profile.phone ?? '-'),
              InfoItem(
                label: 'Ngày sinh',
                value: TimeConvert.convertDateTimeToString(profile.dateOfBirth),
              ),
              InfoItem(
                label: 'Giới tính',
                value: profile.gender?.displayName ?? '-',
              ),
              InfoItem(
                label: 'Địa chỉ',
                value: fullAddress.isEmpty ? '-' : fullAddress,
              ),
            ],
            canEdit: canEditBasicInfo,
            onEdit: onEditBasicInfo,
          ),
          const SizedBox(height: 16),
          InfoSectionCard(
            title: 'Thông tin thêm',
            items: [
              InfoItem(label: 'Dân tộc', value: profile.nationality ?? '-'),
              InfoItem(label: 'Tôn giáo', value: profile.religion ?? '-'),
              InfoItem(
                label: 'Tình trạng hôn nhân',
                value: profile.maritalStatus ?? '-',
              ),
            ],
            canEdit: canEditAdditionalInfo,
            onEdit: onEditAdditionalInfo,
          ),
        ],
      ),
    );
  }
}