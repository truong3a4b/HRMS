import os
import re

directory = r"D:\Learnnig\Android Kotlin\HRMS\hrms-web\src\features\requests\pages"
files_changed = 0

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content = re.sub(
                r'gap-6 px-6 py-6',
                r'gap-5 px-5 py-5',
                content
            )

            if content != new_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                files_changed += 1
                print("Updated " + file)

print(f"Total files updated: {files_changed}")
