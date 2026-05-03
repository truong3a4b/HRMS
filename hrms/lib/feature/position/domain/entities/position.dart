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
    positionSetup,
    positionView,

    recruitmentManageJob,
    recruitmentViewApplication,
    recruitmentManageApplication,
    recruitmentApproveDirect,

    departmentView,
    departmentSetup,

    employeeViewList,
    employeeViewDetail,
    employeeCreate,
    employeeUpdateBasic,
    employeeUpdateJob,
    employeeUpdateSelfBasic,
  }

  extension PermissionKeyX on Permission {
    static Permission? fromString(String key) {
      final normalized = key.replaceAll('PERMISSIONS.', '');

      switch (normalized) {
        case 'POSITION_SETUP':
          return Permission.positionSetup;
        case 'POSITION_VIEW':
          return Permission.positionView;

        case 'RECRUITMENT_MANAGE_JOB':
          return Permission.recruitmentManageJob;
        case 'RECRUITMENT_VIEW_APPLICATION':
          return Permission.recruitmentViewApplication;
        case 'RECRUITMENT_MANAGE_APPLICATION':
          return Permission.recruitmentManageApplication;
        case 'RECRUITMENT_APPROVE_DIRECT':
          return Permission.recruitmentApproveDirect;

        case 'DEPARTMENT_VIEW':
          return Permission.departmentView;
        case 'DEPARTMENT_SETUP':
          return Permission.departmentSetup;

        case 'EMPLOYEE_VIEW_LIST':
          return Permission.employeeViewList;
        case 'EMPLOYEE_VIEW_DETAIL':
          return Permission.employeeViewDetail;
        case 'EMPLOYEE_CREATE':
          return Permission.employeeCreate;
        case 'EMPLOYEE_UPDATE_BASIC':
          return Permission.employeeUpdateBasic;
        case 'EMPLOYEE_UPDATE_JOB':
          return Permission.employeeUpdateJob;
        case 'EMPLOYEE_UPDATE_SELF_BASIC':
          return Permission.employeeUpdateSelfBasic;

        default:
          return null;
      }
    }

    String get key {
      switch (this) {
        case Permission.positionSetup:
          return 'POSITION_SETUP';
        case Permission.positionView:
          return 'POSITION_VIEW';

        case Permission.recruitmentManageJob:
          return 'RECRUITMENT_MANAGE_JOB';
        case Permission.recruitmentViewApplication:
          return 'RECRUITMENT_VIEW_APPLICATION';
        case Permission.recruitmentManageApplication:
          return 'RECRUITMENT_MANAGE_APPLICATION';
        case Permission.recruitmentApproveDirect:
          return 'RECRUITMENT_APPROVE_DIRECT';

        case Permission.departmentView:
          return 'DEPARTMENT_VIEW';
        case Permission.departmentSetup:
          return 'DEPARTMENT_SETUP';

        case Permission.employeeViewList:
          return 'EMPLOYEE_VIEW_LIST';
        case Permission.employeeViewDetail:
          return 'EMPLOYEE_VIEW_DETAIL';
        case Permission.employeeCreate:
          return 'EMPLOYEE_CREATE';
        case Permission.employeeUpdateBasic:
          return 'EMPLOYEE_UPDATE_BASIC';
        case Permission.employeeUpdateJob:
          return 'EMPLOYEE_UPDATE_JOB';
        case Permission.employeeUpdateSelfBasic:
          return 'EMPLOYEE_UPDATE_SELF_BASIC';
      }
    }

    String get label {
      switch (this) {
        case Permission.positionSetup:
          return 'Cấu hình chức vụ';
        case Permission.positionView:
          return 'Xem chức vụ';

        case Permission.recruitmentManageJob:
          return 'Quản lý tin tuyển dụng';
        case Permission.recruitmentViewApplication:
          return 'Xem hồ sơ ứng viên';
        case Permission.recruitmentManageApplication:
          return 'Quản lý hồ sơ ứng viên';
        case Permission.recruitmentApproveDirect:
          return 'Duyệt trực tiếp ứng viên';

        case Permission.departmentView:
          return 'Xem phòng ban';
        case Permission.departmentSetup:
          return 'Cấu hình phòng ban';

        case Permission.employeeViewList:
          return 'Xem danh sách nhân viên';
        case Permission.employeeViewDetail:
          return 'Xem chi tiết nhân viên';
        case Permission.employeeCreate:
          return 'Tạo nhân viên';
        case Permission.employeeUpdateBasic:
          return 'Sửa thông tin cơ bản';
        case Permission.employeeUpdateJob:
          return 'Sửa thông tin công việc';
        case Permission.employeeUpdateSelfBasic:
          return 'Tự sửa thông tin';
      }
    }

    String get group {
      switch (this) {
        case Permission.positionSetup:
        case Permission.positionView:
          return 'Chức vụ';

        case Permission.recruitmentManageJob:
        case Permission.recruitmentViewApplication:
        case Permission.recruitmentManageApplication:
        case Permission.recruitmentApproveDirect:
          return 'Tuyển dụng';

        case Permission.departmentView:
        case Permission.departmentSetup:
          return 'Phòng ban';

        case Permission.employeeViewList:
        case Permission.employeeViewDetail:
        case Permission.employeeCreate:
        case Permission.employeeUpdateBasic:
        case Permission.employeeUpdateJob:
        case Permission.employeeUpdateSelfBasic:
          return 'Nhân viên';
      }
    }
  }