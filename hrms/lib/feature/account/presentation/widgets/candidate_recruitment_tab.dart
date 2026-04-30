import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/utils/platform_file_actions.dart';
import '../../../../core/widget/app_snackbar.dart';
import '../../domain/entities/candidate.dart';

class CandidateRecruitmentTab extends StatelessWidget {
  final Candidate candidate;

  const CandidateRecruitmentTab({super.key, required this.candidate});

  @override
  Widget build(BuildContext context) {
    final cvUrl = candidate.cvUrl;
    final cvName = fileNameFromUrl(cvUrl);

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.fromLTRB(16, 18, 16, 18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFE8E8E8)),
        ),
        child: Column(
          children: [
            Row(
              children: [
                const Expanded(
                  child: Text(
                    'Hồ sơ ứng tuyển',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF2F2F2F),
                    ),
                  ),
                ),
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F7FB),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: IconButton(
                    onPressed: () {
                      context.push('/edit-candidate-profile');
                    },
                    icon: const Icon(
                      Icons.edit_outlined,
                      color: Color(0xFF0E67B2),
                      size: 22,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            _CvFileCard(
              fileName: cvName,
              hasFile: cvUrl != null && cvUrl.trim().isNotEmpty,
              onOpen: () => _openCv(context, cvUrl),
              onDownload: () => _downloadCv(context, cvUrl, cvName),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _openCv(BuildContext context, String? url) async {
    if (url == null || url.trim().isEmpty) {
      AppSnackbar.showError(context, 'Chưa có file CV');
      return;
    }

    try {
      await PlatformFileActions.openUrl(url);
    } catch (_) {
      AppSnackbar.showError(context, 'Không thể mở file CV');
    }
  }

  Future<void> _downloadCv(
    BuildContext context,
    String? url,
    String fileName,
  ) async {
    if (url == null || url.trim().isEmpty) {
      AppSnackbar.showError(context, 'Chưa có file CV');
      return;
    }

    try {
      await PlatformFileActions.downloadUrl(url: url, fileName: fileName);
      AppSnackbar.showSuccess(context, 'Đang tải CV về máy');
    } catch (_) {
      AppSnackbar.showError(context, 'Không thể tải file CV');
    }
  }
}

class _CvFileCard extends StatelessWidget {
  final String fileName;
  final bool hasFile;
  final VoidCallback onOpen;
  final VoidCallback onDownload;

  const _CvFileCard({
    required this.fileName,
    required this.hasFile,
    required this.onOpen,
    required this.onDownload,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFAFAFA),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE8E8E8)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: 44,
            height: 44,
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
            child: Text(
              hasFile ? fileName : 'Chưa có CV',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: Color(0xFF333333),
                height: 1.3,
              ),
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            tooltip: 'Xem CV',
            onPressed: hasFile ? onOpen : null,
            icon: const Icon(Icons.visibility_outlined),
            color: const Color(0xFF0E67B2),
          ),
          IconButton(
            tooltip: 'Tải CV',
            onPressed: hasFile ? onDownload : null,
            icon: const Icon(Icons.file_download_outlined),
            color: const Color(0xFF0E67B2),
          ),
        ],
      ),
    );
  }
}
