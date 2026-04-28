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

  String get key {
    switch (this) {
      case Permission.departmentViewList:
        return 'DEPARTMENT_VIEW_LIST';

      case Permission.employeeCreate:
        return 'EMPLOYEE_CREATE';
      case Permission.employeeUpdateAdditional:
        return 'EMPLOYEE_UPDATE_ADDITIONAL';
      case Permission.employeeUpdateBasic:
        return 'EMPLOYEE_UPDATE_BASIC';
      case Permission.employeeUpdateJob:
        return 'EMPLOYEE_UPDATE_JOB';
      case Permission.employeeUpdateSelfAdditional:
        return 'EMPLOYEE_UPDATE_SELF_ADDITIONAL';
      case Permission.employeeUpdateSelfBasic:
        return 'EMPLOYEE_UPDATE_SELF_BASIC';
      case Permission.employeeViewDetail:
        return 'EMPLOYEE_VIEW_DETAIL';
      case Permission.employeeViewList:
        return 'EMPLOYEE_VIEW_LIST';

      case Permission.positionCreate:
        return 'POSITION_CREATE';
      case Permission.positionViewList:
        return 'POSITION_VIEW_LIST';

      case Permission.canApproveLeave:
        return 'CAN_APPROVE_LEAVE';
      case Permission.canApproveOvertime:
        return 'CAN_APPROVE_OVERTIME';
    }
  }

  String get label {
    switch (this) {
      case Permission.departmentViewList:
        return 'Xem danh sách phòng ban';

      case Permission.employeeCreate:
        return 'Thêm nhân viên';
      case Permission.employeeUpdateAdditional:
        return 'Sửa thông tin thêm của nhân viên';
      case Permission.employeeUpdateBasic:
        return 'Sửa thông tin cơ bản của nhân viên';
      case Permission.employeeUpdateJob:
        return 'Sửa thông tin công việc của nhân viên';
      case Permission.employeeUpdateSelfAdditional:
        return 'Tự sửa thông tin thêm';
      case Permission.employeeUpdateSelfBasic:
        return 'Tự sửa thông tin cơ bản';
      case Permission.employeeViewDetail:
        return 'Xem chi tiết nhân viên';
      case Permission.employeeViewList:
        return 'Xem danh sách nhân viên';

      case Permission.positionCreate:
        return 'Thêm chức vụ';
      case Permission.positionViewList:
        return 'Xem danh sách chức vụ';

      case Permission.canApproveLeave:
        return 'Duyệt nghỉ phép';
      case Permission.canApproveOvertime:
        return 'Duyệt tăng ca';
    }
  }

  String get group {
    switch (this) {
      case Permission.employeeCreate:
      case Permission.employeeUpdateAdditional:
      case Permission.employeeUpdateBasic:
      case Permission.employeeUpdateJob:
      case Permission.employeeUpdateSelfAdditional:
      case Permission.employeeUpdateSelfBasic:
      case Permission.employeeViewDetail:
      case Permission.employeeViewList:
        return 'Nhân viên';

      case Permission.departmentViewList:
        return 'Phòng ban';

      case Permission.positionCreate:
      case Permission.positionViewList:
        return 'Chức vụ';

      case Permission.canApproveLeave:
        return 'Nghỉ phép';

      case Permission.canApproveOvertime:
        return 'Tăng ca';
    }
  }
}
