import os
import re

directory = r"D:\Learnnig\Android Kotlin\HRMS\hrms-web\src\features"
files_changed = 0

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # The regex looks for <h1...>...</h1> followed by <p...>...</p> and removes the <p> block entirely.
            # We must be careful not to remove dynamic <p> like in PayrollEmployeeDetailPage.
            # For static text, the pattern usually matches <p className="text-sm... text-[#667085]...">...</p>
            # Actually, I can just replace the specific text blocks found in the Get-ChildItem command.
            
            # Let's do a safe targeted approach using re.sub with specific patterns.
            
            # EmployeeListPage
            new_content = re.sub(
                r'(<h1[^>]*>\s*Danh sách nhân viên\s*</h1>)\s*<p className="text-sm text-\[#667085\]">\s*Quản lý thông tin nhân viên\s*</p>',
                r'\1',
                content
            )
            
            # PayrollBonusPenaltyPage
            new_content = re.sub(
                r'(<h1[^>]*>\s*Phiếu thưởng/phạt\s*</h1>)\s*<p className="text-sm text-\[#667085\]">\s*Quản lý phiếu thưởng, phiếu phạt thủ công và phiếu phạt tự động\s*</p>',
                r'\1',
                new_content
            )
            
            # PayrollPage
            new_content = re.sub(
                r'(<h1[^>]*>\s*\{isMine \? "Bảng lương của tôi" : "Bảng lương"\}\s*</h1>)\s*<p className="text-sm text-\[#667085\]">\s*\{isMine\s*\?\s*"Xem chi tiết bảng lương các kỳ của bạn"\s*:\s*"Quản lý và xem bảng lương của toàn bộ nhân viên"\}\s*</p>',
                r'\1',
                new_content
            )

            # PayrollPeriodListPage
            new_content = re.sub(
                r'(<h1[^>]*>Kỳ lương</h1>)\s*<p className="text-sm text-\[#667085\]">Quản lý các kỳ lương và quy trình duyệt.</p>',
                r'\1',
                new_content
            )

            # PayrollPolicyPage
            new_content = re.sub(
                r'(<h1[^>]*>Chính sách lương</h1>)\s*<p className="text-sm text-\[#667085\]">Quản lý bảo hiểm, thuế thu nhập cá nhân và phụ cấp</p>',
                r'\1',
                new_content
            )

            # PositionListPage
            new_content = re.sub(
                r'(<h1[^>]*>\s*Danh sách chức vụ\s*</h1>)\s*<p className="text-sm text-\[#667085\]">\s*Quản lý chức vụ và phân quyền theo vai trò công việc\s*</p>',
                r'\1',
                new_content
            )

            # RecruitmentApplicationListPage
            new_content = re.sub(
                r'(<h1[^>]*>\s*\{mine \? "Đơn ứng tuyển của tôi" : "Danh sách ứng tuyển"\}\s*</h1>)\s*<p className="text-sm text-\[#667085\]">\s*\{mine\s*\?\s*"Theo dõi trạng thái các vị trí bạn đã ứng tuyển"\s*:\s*"Quản lý hồ sơ ứng viên trong quy trình tuyển dụng"\}\s*</p>',
                r'\1',
                new_content
            )

            # RecruitmentJobListPage
            new_content = re.sub(
                r'(<h1[^>]*>\s*Vị trí tuyển dụng\s*</h1>)\s*<p className="text-sm text-\[#667085\]">\s*Quản lý tin tuyển dụng và cho phép ứng viên ứng tuyển\s*</p>',
                r'\1',
                new_content
            )

            # RequestHeader.tsx
            new_content = re.sub(
                r'(<h1[^>]*>\s*\{title\}\s*</h1>)\s*<p className="mt-1 text-sm text-\[#667085\]">\s*\{description\}\s*</p>',
                r'\1',
                new_content
            )

            # RequestCreatePage
            new_content = re.sub(
                r'(<h1[^>]*>\s*Bạn muốn tạo yêu cầu gì\?\s*</h1>)\s*<p className="mt-3 text-base text-\[#667085\] max-w-xl mx-auto">\s*Vui lòng chọn một trong các loại đơn bên dưới để bắt đầu điền thông tin và gửi yêu cầu phê duyệt đến quản lý của bạn.\s*</p>',
                r'\1',
                new_content
            )

            # ScheduleAssignPage
            new_content = re.sub(
                r'(<h1[^>]*>\s*Áp lịch làm việc\s*</h1>)\s*<p className="text-sm text-\[#667085\]">\s*Dành cho admin/hr: chọn ngày, chọn ca và áp cho phòng ban hoặc nhân viên cụ thể\s*</p>',
                r'\1',
                new_content
            )

            # ScheduleRegisterPage
            new_content = re.sub(
                r'(<h1[^>]*>\s*Đăng ký lịch làm việc\s*</h1>)\s*<p className="text-sm text-\[#667085\]">\s*Nhân viên tự chọn ngày, chọn ca và gửi yêu cầu phê duyệt\s*</p>',
                r'\1',
                new_content
            )

            # ScheduleWeeklyPage
            new_content = re.sub(
                r'(<h1[^>]*>\s*\{isSelfSchedule\s*\?\s*"Lịch làm việc của tôi"\s*:\s*"Lịch làm việc nhân viên"\}\s*</h1>)\s*<p className="text-sm text-slate-500">\s*\{isSelfSchedule\s*\?\s*"Xem và quản lý lịch làm việc cá nhân theo tuần"\s*:\s*"Quản lý và theo dõi lịch làm việc của toàn bộ nhân sự"\}\s*</p>',
                r'\1',
                new_content
            )

            # WorkShiftListPage
            new_content = re.sub(
                r'(<h1[^>]*>\s*Danh sách ca làm việc\s*</h1>)\s*<p className="text-sm text-\[#667085\]">\s*Quản lý giờ làm, đơn vị công và cấu hình chấm công theo ca\s*</p>',
                r'\1',
                new_content
            )

            # DepartmentListPage
            new_content = re.sub(
                r'(<h1[^>]*>\s*Danh sách bộ phận\s*</h1>)\s*<p className="text-sm text-\[#667085\]">\s*Quản lý bộ phận, trưởng bộ phận và số lượng nhân viên\s*</p>',
                r'\1',
                new_content
            )
            
            # AttendanceManagementPage
            new_content = re.sub(
                r'(<h1[^>]*>\s*\{isMine \? "Chấm công của tôi" : "Bảng chấm công"\}\s*</h1>)\s*<p className="text-sm text-slate-500">\s*\{isMine\s*\?\s*"Xem chi tiết giờ vào/ra, làm thêm và số công theo ngày"\s*:\s*"Quản lý và theo dõi dữ liệu chấm công của nhân sự"\}\s*</p>',
                r'\1',
                new_content
            )

            if content != new_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                files_changed += 1
                print("Updated " + file)

print(f"Total files updated: {files_changed}")
