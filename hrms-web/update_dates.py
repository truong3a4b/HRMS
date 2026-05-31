import os
import re

src_dir = 'src'
date_pattern = re.compile(
    r'(?P<export>export\s+)?function\s+formatDate\s*\(\s*value\s*\??\s*:\s*string\s*\|\s*null\s*\)\s*\{(?:[^{}]*|\{[^{}]*\})*\}'
)
datetime_pattern = re.compile(
    r'(?P<export>export\s+)?function\s+formatDateTime\s*\(\s*value\s*\??\s*:\s*string\s*\|\s*null\s*\)\s*\{(?:[^{}]*|\{[^{}]*\})*\}'
)

new_date_func = r'''\g<export>function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}'''

new_datetime_func = r'''\g<export>function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}'''

count_date = 0
count_datetime = 0

for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            orig_content = content
            
            content, n_date = date_pattern.subn(new_date_func, content)
            content, n_datetime = datetime_pattern.subn(new_datetime_func, content)
            
            if content != orig_content:
                count_date += n_date
                count_datetime += n_datetime
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f'Updated {filepath}: {n_date} date, {n_datetime} datetime')

print(f'Total replaced: {count_date} formatDates, {count_datetime} formatDateTimes')
