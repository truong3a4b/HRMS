import 'package:flutter/material.dart';

class CvPickerTile extends StatelessWidget {
  final String fileName;
  final bool hasNewFile;
  final VoidCallback onPick;

  const CvPickerTile({
    required this.fileName,
    required this.hasNewFile,
    required this.onPick,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPick,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFD8D8D8)),
        ),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F7FB),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.description_outlined,
                color: Color(0xFF0E67B2),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    fileName == '-' ? 'Chưa có CV' : fileName,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Color(0xFF333333),
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    hasNewFile
                        ? 'File mới đã chọn'
                        : 'Chạm để chọn file CV',
                    style: const TextStyle(
                      color: Color(0xFF9A9A9A),
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.upload_file_outlined, color: Color(0xFF0E67B2)),
          ],
        ),
      ),
    );
  }
}