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
  positionCreate,
  positionDelete,
  positionViewList,

  recruitmentViewJob,
  recruitmentManageJob,
  recruitmentCreateJob,
  recruitmentUpdateJob,
  recruitmentCloseJob,
  recruitmentViewPipeline,
  recruitmentViewApplication,
  recruitmentManageApplication,
  recruitmentScheduleInterview,
  recruitmentSubmitEvaluation,
  recruitmentApproveDirect,

  departmentViewList,

  employeeViewList,
  employeeViewDetail,
  employeeCreate,
  employeeUpdateBasic,
  employeeUpdateAdditional,
  employeeUpdateJob,
  employeeUpdateSelfBasic,
  employeeUpdateSelfAdditional,
}

extension PermissionKeyX on Permission {
  static Permission? fromString(String key) {
    final normalized = key.replaceAll('PERMISSIONS.', '');

    switch (normalized) {
      case 'POSITION_CREATE':
        return Permission.positionCreate;
      case 'POSITION_DELETE':
        return Permission.positionDelete;
      case 'POSITION_VIEW_LIST':
        return Permission.positionViewList;

      case 'RECRUITMENT_VIEW_JOB':
        return Permission.recruitmentViewJob;
      case 'RECRUITMENT_MANAGE_JOB':
        return Permission.recruitmentManageJob;
      case 'RECRUITMENT_CREATE_JOB':
        return Permission.recruitmentCreateJob;
      case 'RECRUITMENT_UPDATE_JOB':
        return Permission.recruitmentUpdateJob;
      case 'RECRUITMENT_CLOSE_JOB':
        return Permission.recruitmentCloseJob;
      case 'RECRUITMENT_VIEW_PIPELINE':
        return Permission.recruitmentViewPipeline;
      case 'RECRUITMENT_VIEW_APPLICATION':
        return Permission.recruitmentViewApplication;
      case 'RECRUITMENT_MANAGE_APPLICATION':
        return Permission.recruitmentManageApplication;
      case 'RECRUITMENT_SCHEDULE_INTERVIEW':
        return Permission.recruitmentScheduleInterview;
      case 'RECRUITMENT_SUBMIT_EVALUATION':
        return Permission.recruitmentSubmitEvaluation;
      case 'RECRUITMENT_APPROVE_DIRECT':
        return Permission.recruitmentApproveDirect;

      case 'DEPARTMENT_VIEW_LIST':
        return Permission.departmentViewList;

      case 'EMPLOYEE_VIEW_LIST':
        return Permission.employeeViewList;
      case 'EMPLOYEE_VIEW_DETAIL':
        return Permission.employeeViewDetail;
      case 'EMPLOYEE_CREATE':
        return Permission.employeeCreate;
      case 'EMPLOYEE_UPDATE_BASIC':
        return Permission.employeeUpdateBasic;
      case 'EMPLOYEE_UPDATE_ADDITIONAL':
        return Permission.employeeUpdateAdditional;
      case 'EMPLOYEE_UPDATE_JOB':
        return Permission.employeeUpdateJob;
      case 'EMPLOYEE_UPDATE_SELF_BASIC':
        return Permission.employeeUpdateSelfBasic;
      case 'EMPLOYEE_UPDATE_SELF_ADDITIONAL':
        return Permission.employeeUpdateSelfAdditional;

      default:
        return null;
    }
  }

  String get key {
    switch (this) {
      case Permission.positionCreate:
        return 'POSITION_CREATE';
      case Permission.positionDelete:
        return 'POSITION_DELETE';
      case Permission.positionViewList:
        return 'POSITION_VIEW_LIST';

      case Permission.recruitmentViewJob:
        return 'RECRUITMENT_VIEW_JOB';
      case Permission.recruitmentManageJob:
        return 'RECRUITMENT_MANAGE_JOB';
      case Permission.recruitmentCreateJob:
        return 'RECRUITMENT_CREATE_JOB';
      case Permission.recruitmentUpdateJob:
        return 'RECRUITMENT_UPDATE_JOB';
      case Permission.recruitmentCloseJob:
        return 'RECRUITMENT_CLOSE_JOB';
      case Permission.recruitmentViewPipeline:
        return 'RECRUITMENT_VIEW_PIPELINE';
      case Permission.recruitmentViewApplication:
        return 'RECRUITMENT_VIEW_APPLICATION';
      case Permission.recruitmentManageApplication:
        return 'RECRUITMENT_MANAGE_APPLICATION';
      case Permission.recruitmentScheduleInterview:
        return 'RECRUITMENT_SCHEDULE_INTERVIEW';
      case Permission.recruitmentSubmitEvaluation:
        return 'RECRUITMENT_SUBMIT_EVALUATION';
      case Permission.recruitmentApproveDirect:
        return 'RECRUITMENT_APPROVE_DIRECT';

      case Permission.departmentViewList:
        return 'DEPARTMENT_VIEW_LIST';

      case Permission.employeeViewList:
        return 'EMPLOYEE_VIEW_LIST';
      case Permission.employeeViewDetail:
        return 'EMPLOYEE_VIEW_DETAIL';
      case Permission.employeeCreate:
        return 'EMPLOYEE_CREATE';
      case Permission.employeeUpdateBasic:
        return 'EMPLOYEE_UPDATE_BASIC';
      case Permission.employeeUpdateAdditional:
        return 'EMPLOYEE_UPDATE_ADDITIONAL';
      case Permission.employeeUpdateJob:
        return 'EMPLOYEE_UPDATE_JOB';
      case Permission.employeeUpdateSelfBasic:
        return 'EMPLOYEE_UPDATE_SELF_BASIC';
      case Permission.employeeUpdateSelfAdditional:
        return 'EMPLOYEE_UPDATE_SELF_ADDITIONAL';
    }
  }

  String get label {
    switch (this) {
      case Permission.positionCreate:
        return 'Thêm chức vụ';
      case Permission.positionDelete:
        return 'Xóa chức vụ';
      case Permission.positionViewList:
        return 'Xem danh sách chức vụ';

      case Permission.recruitmentViewJob:
        return 'Xem tin tuyển dụng';
      case Permission.recruitmentManageJob:
        return 'Quản lý tin tuyển dụng';
      case Permission.recruitmentCreateJob:
        return 'Tạo tin tuyển dụng';
      case Permission.recruitmentUpdateJob:
        return 'Cập nhật tin tuyển dụng';
      case Permission.recruitmentCloseJob:
        return 'Đóng tin tuyển dụng';
      case Permission.recruitmentViewPipeline:
        return 'Xem quy trình tuyển dụng';
      case Permission.recruitmentViewApplication:
        return 'Xem hồ sơ ứng viên';
      case Permission.recruitmentManageApplication:
        return 'Quản lý hồ sơ ứng viên';
      case Permission.recruitmentScheduleInterview:
        return 'Lên lịch phỏng vấn';
      case Permission.recruitmentSubmitEvaluation:
        return 'Gửi đánh giá phỏng vấn';
      case Permission.recruitmentApproveDirect:
        return 'Duyệt ứng viên trực tiếp';

      case Permission.departmentViewList:
        return 'Xem danh sách phòng ban';

      case Permission.employeeViewList:
        return 'Xem danh sách nhân viên';
      case Permission.employeeViewDetail:
        return 'Xem chi tiết nhân viên';
      case Permission.employeeCreate:
        return 'Thêm nhân viên';
      case Permission.employeeUpdateBasic:
        return 'Sửa thông tin cơ bản của nhân viên';
      case Permission.employeeUpdateAdditional:
        return 'Sửa thông tin bổ sung của nhân viên';
      case Permission.employeeUpdateJob:
        return 'Sửa thông tin công việc của nhân viên';
      case Permission.employeeUpdateSelfBasic:
        return 'Tự sửa thông tin cơ bản';
      case Permission.employeeUpdateSelfAdditional:
        return 'Tự sửa thông tin bổ sung';
    }
  }

  String get group {
    switch (this) {
      case Permission.positionCreate:
      case Permission.positionDelete:
      case Permission.positionViewList:
        return 'Chức vụ';

      case Permission.recruitmentViewJob:
      case Permission.recruitmentManageJob:
      case Permission.recruitmentCreateJob:
      case Permission.recruitmentUpdateJob:
      case Permission.recruitmentCloseJob:
      case Permission.recruitmentViewPipeline:
      case Permission.recruitmentViewApplication:
      case Permission.recruitmentManageApplication:
      case Permission.recruitmentScheduleInterview:
      case Permission.recruitmentSubmitEvaluation:
      case Permission.recruitmentApproveDirect:
        return 'Tuyển dụng';

      case Permission.departmentViewList:
        return 'Phòng ban';

      case Permission.employeeViewList:
      case Permission.employeeViewDetail:
      case Permission.employeeCreate:
      case Permission.employeeUpdateBasic:
      case Permission.employeeUpdateAdditional:
      case Permission.employeeUpdateJob:
      case Permission.employeeUpdateSelfBasic:
      case Permission.employeeUpdateSelfAdditional:
        return 'Nhân viên';
    }
  }
}