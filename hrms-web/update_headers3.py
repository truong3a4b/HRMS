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

            # ScheduleWeeklyPage has text-slate-500
            new_content = re.sub(
                r'(<h1[^>]*>\s*\{isSelfSchedule[\s\S]*?\}\s*</h1>)\s*<p[^>]*>\s*\{isSelfSchedule[\s\S]*?\}\s*</p>',
                r'\1',
                new_content
            )

            # Let's use a simpler pattern just replacing the p tag next to the h1
            if 'AttendanceManagementPage' in file:
                new_content = re.sub(
                    r'(<h1[^>]*>\s*\{isMine[\s\S]*?\}\s*</h1>)\s*<p className="text-sm text-slate-500">[\s\S]*?</p>',
                    r'\1',
                    content
                )
            elif 'ScheduleWeeklyPage' in file:
                new_content = re.sub(
                    r'(<h1[^>]*>\s*\{isSelfSchedule[\s\S]*?\}\s*</h1>)\s*<p className="text-sm text-slate-500">[\s\S]*?</p>',
                    r'\1',
                    content
                )

            if content != new_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                files_changed += 1
                print("Updated " + file)

print(f"Total files updated: {files_changed}")
