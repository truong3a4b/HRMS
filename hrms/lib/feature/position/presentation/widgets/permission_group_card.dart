
import 'package:flutter/material.dart';

import '../../domain/entities/position.dart';

class PermissionGroupCard extends StatelessWidget {
  final String groupName;
  final List<Permission> permissions;
  final Set<Permission> selectedPermissions;
  final void Function(String groupName, bool selected) onToggleGroup;
  final void Function(Permission permission, bool selected) onTogglePermission;

  const PermissionGroupCard({
    required this.groupName,
    required this.permissions,
    required this.selectedPermissions,
    required this.onToggleGroup,
    required this.onTogglePermission,
  });

  @override
  Widget build(BuildContext context) {
    final selectedCount =
        permissions.where((p) => selectedPermissions.contains(p)).length;

    final isAllGroupSelected = selectedCount == permissions.length;
    final hasSelected = selectedCount > 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE3E3E3)),
        borderRadius: BorderRadius.circular(14),
      ),
      child: ExpansionTile(
        tilePadding: const EdgeInsets.symmetric(horizontal: 14),
        childrenPadding: const EdgeInsets.fromLTRB(8, 0, 8, 10),
        title: Text(
          groupName,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
          ),
        ),
        subtitle: Text(
          '$selectedCount/${permissions.length} quyền đã chọn',
          style: const TextStyle(
            fontSize: 13,
            color: Color(0xFF7A7A7A),
          ),
        ),
        trailing: Checkbox(
          value: isAllGroupSelected
              ? true
              : hasSelected
              ? null
              : false,
          tristate: true,
          onChanged: (_) {
            onToggleGroup(groupName, !isAllGroupSelected);
          },
        ),
        children: permissions.map((permission) {
          final isSelected = selectedPermissions.contains(permission);

          return CheckboxListTile(
            value: isSelected,
            onChanged: (value) {
              onTogglePermission(permission, value ?? false);
            },
            activeColor: const Color(0xFF005BAC),
            controlAffinity: ListTileControlAffinity.leading,
            title: Text(
              permission.label,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}