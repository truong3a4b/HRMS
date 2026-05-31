import 'package:flutter/material.dart';

import '../../domain/entities/request.dart';

class RequestStatusBadge extends StatelessWidget {
  final RequestStatus status;

  const RequestStatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final colors = _statusColors(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: colors.background,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: colors.border),
      ),
      child: Text(
        status.displayName,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: colors.foreground,
        ),
      ),
    );
  }
}

class _BadgeColors {
  final Color background;
  final Color foreground;
  final Color border;

  const _BadgeColors(this.background, this.foreground, this.border);
}

_BadgeColors _statusColors(RequestStatus status) {
  switch (status) {
    case RequestStatus.pending:
      return const _BadgeColors(
        Color(0xFFFFF7E6),
        Color(0xFFB26A00),
        Color(0xFFFFD98A),
      );
    case RequestStatus.processing:
      return const _BadgeColors(
        Color(0xFFEAF4FF),
        Color(0xFF0069B4),
        Color(0xFFB8DAFF),
      );
    case RequestStatus.approved:
      return const _BadgeColors(
        Color(0xFFEAF7EF),
        Color(0xFF1F8F4D),
        Color(0xFFA9DEC0),
      );
    case RequestStatus.rejected:
      return const _BadgeColors(
        Color(0xFFFFF0F0),
        Color(0xFFB42318),
        Color(0xFFF7B4AF),
      );
    case RequestStatus.cancelled:
      return const _BadgeColors(
        Color(0xFFF0F0F0),
        Color(0xFF667085),
        Color(0xFFD0D5DD),
      );
    case RequestStatus.failed:
      return const _BadgeColors(
        Color(0xFFFFF0F0),
        Color(0xFFB42318),
        Color(0xFFF7B4AF),
      );
  }
}
