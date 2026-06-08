# Tài liệu API Hệ thống HRMS (Kèm Mô Tả)

Đây là danh sách tổng hợp các API Endpoint hiện có trong hệ thống kèm mô tả chi tiết chức năng nghiệp vụ.

## 1. Module: AUTH (Xác thực & Tài khoản)
- **POST** `/api/auth/register` : Đăng ký tài khoản mới.
- **POST** `/api/auth/verify-otp` : Xác thực mã OTP khi đăng ký.
- **POST** `/api/auth/login` : Đăng nhập hệ thống lấy Access Token.
- **POST** `/api/auth/forgot-password` : Yêu cầu gửi OTP quên mật khẩu.
- **POST** `/api/auth/reset-password` : Đặt lại mật khẩu mới bằng OTP.
- **POST** `/api/auth/verify-reset-otp` : Xác thực mã OTP đặt lại mật khẩu.
- **POST** `/api/auth/change-password` : Đổi mật khẩu trong khi đang đăng nhập.
- **POST** `/api/auth/refresh` : Cấp lại Token mới (Refresh Token).
- **POST** `/api/auth/logout` : Đăng xuất, hủy bỏ Token.
- **GET** `/api/auth/me` : Lấy thông tin user đang đăng nhập.
- **GET** `/api/auth/my-permissions` : Lấy danh sách quyền hạn (permissions) của user hiện tại.

## 2. Module: EMPLOYEE (Nhân sự)
- **GET** `/api/employees` : Lấy danh sách tất cả nhân viên.
- **GET** `/api/employees/import/template` : Tải file Excel mẫu để Import nhân sự.
- **POST** `/api/employees/import/preview` : Tải lên file Excel và xem trước kết quả.
- **POST** `/api/employees/import/:batchId/confirm` : Xác nhận Import hàng loạt nhân sự vào CSDL.
- **GET** `/api/employees/me` : Lấy hồ sơ nhân sự của bản thân.
- **GET** `/api/employees/me/job-history` : Xem lịch sử công tác, thuyên chuyển của bản thân.
- **GET** `/api/employees/:id` : Lấy thông tin chi tiết một nhân viên cụ thể.
- **GET** `/api/employees/:id/job-history` : Xem lịch sử công tác của nhân viên cụ thể.
- **PATCH** `/api/employees/me/basic` : Nhân viên tự cập nhật thông tin cá nhân cơ bản.
- **PATCH** `/api/employees/me/additional` : Nhân viên tự cập nhật thông tin bổ sung.
- **POST** `/api/employees` : Nhân sự thêm mới một hồ sơ nhân viên.
- **PATCH** `/api/employees/:id/basic` : Nhân sự cập nhật thông tin cơ bản cho nhân viên.
- **PATCH** `/api/employees/:id/additional` : Nhân sự cập nhật thông tin bổ sung.
- **PATCH** `/api/employees/:id/job` : Nhân sự cập nhật chức vụ/phòng ban (thuyên chuyển).

## 3. Module: DEPARTMENT (Phòng ban) & POSITION (Chức vụ)
- **GET** `/api/departments` : Lấy danh sách phòng ban.
- **GET** `/api/departments/:id` : Xem chi tiết thông tin phòng ban.
- **POST** `/api/departments` : Tạo phòng ban mới.
- **PATCH** `/api/departments/:id/manager` : Thay đổi trưởng phòng.
- **PATCH** `/api/departments/:id/basic` : Sửa tên, mô tả phòng ban.
- **DELETE** `/api/departments/:id` : Xóa phòng ban.
- **GET** `/api/positions/:id` : Xem chi tiết chức vụ.
- **POST** `/api/positions` : Tạo chức vụ mới.
- **PUT** `/api/positions/:id` : Cập nhật thông tin chức vụ.
- **DELETE** `/api/positions/:id` : Xóa chức vụ.

## 4. Module: ATTENDANCE (Chấm công)
- **GET** `/api/attendance/history/me` : Xem lịch sử quẹt thẻ/điểm danh cá nhân.
- **GET** `/api/attendance/history/employees/:employeeId` : Quản lý xem lịch sử quẹt thẻ của nhân viên.
- **GET** `/api/attendance/timesheet/me` : Xem bảng tổng hợp công (Timesheet) cá nhân.
- **GET** `/api/attendance/timesheet/employees/:employeeId` : Xem bảng tổng hợp công của nhân viên.
- **POST** `/api/attendance/compensation-requests` : Tạo đơn xin bù công/sửa công.

## 5. Module: ATTENDANCE DEVICE (Máy chấm công)
- **GET** `/api/attendance-devices` : Lấy danh sách thiết bị chấm công.
- **POST** `/api/attendance-devices` : Thêm mới máy chấm công (khai báo IP, Port).
- **GET** `/api/attendance-devices/:id` : Xem chi tiết máy chấm công.
- **PATCH** `/api/attendance-devices/:id` : Chỉnh sửa cấu hình máy chấm công.
- **DELETE** `/api/attendance-devices/:id` : Xóa thiết bị khỏi hệ thống.
- **POST** `/api/attendance-devices/:id/fingerprints` : Đồng bộ (đẩy) vân tay từ Server xuống máy chấm công.
- **GET** `/api/attendance-devices/:id/fingerprints` : Lấy danh sách vân tay hiện có trên máy.
- **DELETE** `/api/attendance-devices/:id/fingerprints/:fingerprintId` : Xóa một vân tay khỏi máy chấm công.

## 6. Module: WORK-SHIFT & SCHEDULE (Ca làm việc & Phân lịch)
- **GET** `/api/work-shifts` : Lấy danh sách các ca làm việc (Ca sáng, chiều, hành chính...).
- **POST** `/api/work-shifts` : Tạo mới ca làm việc.
- **GET** `/api/work-shifts/:id` : Lấy chi tiết ca làm việc.
- **PATCH** `/api/work-shifts/:id` : Cập nhật cấu hình ca làm việc.
- **DELETE** `/api/work-shifts/:id` : Xóa ca làm việc.
- **POST** `/api/schedule-assignments` : Trưởng phòng/Nhân sự phân ca làm việc cho nhân viên.
- **POST** `/api/schedule-assignments/register` : Nhân viên tự đăng ký lịch làm việc theo ca.
- **GET** `/api/schedule-assignments/me` : Xem lịch làm việc của bản thân trong tuần/tháng.
- **GET** `/api/schedule-assignments/employee/:id` : Xem lịch làm việc của nhân viên cấp dưới.

## 7. Module: REQUEST (Đơn từ & Phê duyệt)
- **GET** `/api/requests/me` : Danh sách đơn từ bản thân đã tạo.
- **GET** `/api/requests/me/watching` : Danh sách đơn từ đang được tag theo dõi (Cc).
- **GET** `/api/requests/me/pending-approvals` : Danh sách đơn từ đang chờ bản thân duyệt.
- **GET** `/api/requests` : Toàn bộ yêu cầu/đơn từ trong hệ thống (Dành cho HR).
- **POST** `/api/requests/leave` : Tạo đơn xin nghỉ phép.
- **POST** `/api/requests/late-early` : Tạo đơn xin đi muộn / về sớm.
- **POST** `/api/requests/attendance-correction` : Tạo đơn xin điều chỉnh giờ chấm công.
- **POST** `/api/requests/bonus-penalty` : Tạo đề xuất thưởng / phạt.
- **POST** `/api/requests` : Tạo yêu cầu chung theo loại nghiệp vụ.
- **GET** `/api/requests/:id` : Xem chi tiết một đơn từ.
- **POST** `/api/requests/:id/start-review` : Người duyệt bắt đầu xem xét, chuyển đơn sang `PROCESSING` nếu còn `PENDING`.
- **POST** `/api/requests/:id/decision` : Người duyệt được phân công đưa ra quyết định. Body chỉ nhận `decision = APPROVED | REJECTED` và `note` tùy chọn; với duyệt tuần tự, người duyệt phải đúng `currentStep`.
- **POST** `/api/requests/:id/cancel` : Người tạo hoặc quản trị viên hủy đơn khi trạng thái còn `PENDING` hoặc `PROCESSING`.

Trạng thái yêu cầu: `PENDING`, `PROCESSING`, `APPROVED`, `REJECTED`, `CANCELLED`, `FAILED`. `FAILED` dùng khi đủ điều kiện duyệt nhưng bước áp dụng dữ liệu nghiệp vụ thất bại.

## 8. Module: PAYROLL & POLICY (Lương & Chính sách)
- **GET / POST / PUT / DELETE** `/api/payroll-policies/insurance` : Quản lý chính sách Bảo hiểm.
- **GET / POST / PUT / DELETE** `/api/payroll-policies/tax` : Quản lý cấu hình biểu Thuế lũy tiến.
- **GET / POST / PUT / DELETE** `/api/payroll-policies/allowances` : Quản lý các loại Phụ cấp.
- **POST** `/api/payroll-policies/allowances/assign` : Gán phụ cấp cho nhân viên.
- **GET / POST / PUT / DELETE** `/api/payroll-policies/auto-penalties` : Quản lý chính sách tự động phạt (đi muộn/về sớm).
- **GET / POST / PUT / DELETE** `/api/payroll-policies/holidays` : Quản lý lịch ngày nghỉ lễ có lương.
- **GET / PUT** `/api/payroll-policies/annual-leave-balances/employees/:employeeId` : Quản lý quỹ phép năm của nhân viên.
- **POST** `/api/payrolls/periods/:periodId/overview` : Tổng quan kỳ lương.
- **POST** `/api/payrolls` : Khởi tạo tính lương cho một chu kỳ.
- **POST** `/api/payrolls/periods/:periodId/request-approval` : Trình duyệt bảng lương.
- **POST** `/api/payrolls/periods/:periodId/approve` : Phê duyệt bảng lương.
- **POST** `/api/payrolls/pay-many` : Thực hiện chi trả lương (Cập nhật trạng thái đã thanh toán).
- **GET** `/api/payrolls/mine` : Nhân viên xem bảng lương/phiếu lương cá nhân.

## 9. Module: RECRUITMENT & CANDIDATE (Tuyển dụng & Ứng viên)
- **GET** `/api/recruitment/jobs/:id` : Xem chi tiết tin tuyển dụng.
- **POST** `/api/recruitment/applications` : Nộp đơn ứng tuyển cho một vị trí.
- **PATCH** `/api/recruitment/applications/:id/evaluations/:evaluationId` : Cập nhật kết quả đánh giá phỏng vấn.
- **POST** `/api/recruitment/applications/:id/offer/respond` : Ứng viên phản hồi lại thư mời nhận việc (Đồng ý/Từ chối).
- **GET** `/api/candidates` : HR xem danh sách toàn bộ ứng viên.
- **GET** `/api/candidates/applications/me` : Ứng viên xem trạng thái các đơn ứng tuyển của mình.

## 10. Module: NOTIFICATION (Thông báo)
- **GET** `/api/notifications/me` : Lấy danh sách thông báo của user hiện tại.
- **GET** `/api/notifications/me/unread-count` : Số lượng thông báo chưa đọc (Để hiện chấm đỏ UI).
- **PATCH** `/api/notifications/me/read-all` : Đánh dấu đã đọc tất cả.
- **PATCH** `/api/notifications/me/:id/read` : Đánh dấu một thông báo là đã đọc.
- **POST** `/api/notifications` : Bắn thông báo thủ công tới người dùng.
