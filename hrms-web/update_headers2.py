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

            new_content = content

            # AttendanceManagementPage
            new_content = re.sub(
                r'(<h1[^>]*>\s*\{isMine \? "Chấm công của tôi" : "Bảng chấm công"\}\s*</h1>)\s*<p[^>]*>\s*\{isMine[\s\S]*?\}\s*</p>',
                r'\1',
                new_content
            )

            # PayrollBonusPenaltyPage
            new_content = re.sub(
                r'(<h1[^>]*>\s*Phiếu thưởng/phạt\s*</h1>)\s*<p[^>]*>[\s\S]*?phiếu phạt tự động[\s\S]*?</p>',
                r'\1',
                new_content
            )

            # PayrollPage
            new_content = re.sub(
                r'(<h1[^>]*>\s*\{isMine \? "Bảng lương của tôi" : "Bảng lương"\}\s*</h1>)\s*<p[^>]*>\s*\{isMine[\s\S]*?\}\s*</p>',
                r'\1',
                new_content
            )

            # ScheduleAssignPage
            new_content = re.sub(
                r'(<h1[^>]*>\s*Áp lịch làm việc\s*</h1>)\s*<p[^>]*>[\s\S]*?phòng ban hoặc[\s\S]*?</p>',
                r'\1',
                new_content
            )

            # ScheduleWeeklyPage
            new_content = re.sub(
                r'(<h1[^>]*>\s*\{isSelfSchedule[\s\S]*?\}\s*</h1>)\s*<p[^>]*>\s*\{isSelfSchedule[\s\S]*?\}\s*</p>',
                r'\1',
                new_content
            )

            if content != new_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                files_changed += 1
                print("Updated " + file)

print(f"Total files updated: {files_changed}")
