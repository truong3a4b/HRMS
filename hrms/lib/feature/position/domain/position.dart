class Position {
  final String id;
  final String name;
  final String? code;
  final String? description;
  final List<Permission> permissions;
  Position({
    required this.id,
    required this.name,
    this.code,
    this.description,
    this.permissions = const [],
  });
}

enum Permission {
  departmentViewList,

  employeeCreate,
  employeeUpdateAdditional,
  employeeUpdateBasic,
  employeeUpdateJob,

  employeeUpdateSelfAdditional,
  employeeUpdateSelfBasic,

  employeeViewDetail,
  employeeViewList,

  positionCreate,
  positionViewList,

  canApproveLeave,
  canApproveOvertime,
}
extension PermissionKeyX on Permission {
  static Permission? fromString(String key) {
    final normalized = key.replaceAll('PERMISSIONS.', '');

    switch (normalized) {
      case 'DEPARTMENT_VIEW_LIST':
        return Permission.departmentViewList;

      case 'EMPLOYEE_CREATE':
        return Permission.employeeCreate;

      case 'EMPLOYEE_UPDATE_ADDITIONAL':
        return Permission.employeeUpdateAdditional;

      case 'EMPLOYEE_UPDATE_BASIC':
        return Permission.employeeUpdateBasic;

      case 'EMPLOYEE_UPDATE_JOB':
        return Permission.employeeUpdateJob;

      case 'EMPLOYEE_UPDATE_SELF_ADDITIONAL':
        return Permission.employeeUpdateSelfAdditional;

      case 'EMPLOYEE_UPDATE_SELF_BASIC':
        return Permission.employeeUpdateSelfBasic;

      case 'EMPLOYEE_VIEW_DETAIL':
        return Permission.employeeViewDetail;

      case 'EMPLOYEE_VIEW_LIST':
        return Permission.employeeViewList;

      case 'POSITION_CREATE':
        return Permission.positionCreate;

      case 'POSITION_VIEW_LIST':
        return Permission.positionViewList;

      default:
        return null;
    }
  }
}