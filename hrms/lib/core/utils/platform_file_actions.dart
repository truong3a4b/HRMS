import 'dart:typed_data';

import 'package:flutter/services.dart';

class PickedCvFile {
  final String name;
  final Uint8List bytes;

  const PickedCvFile({
    required this.name,
    required this.bytes,
  });
}

class PlatformFileActions {
  static const MethodChannel _channel = MethodChannel('hrms/file_actions');

  static Future<PickedCvFile?> pickCvFile() async {
    final result = await _channel.invokeMapMethod<String, dynamic>('pickCvFile');
    if (result == null) return null;

    final name = result['name'] as String?;
    final bytes = result['bytes'] as Uint8List?;
    if (name == null || bytes == null) return null;

    return PickedCvFile(name: name, bytes: bytes);
  }

  static Future<void> openUrl(String url) async {
    await _channel.invokeMethod<void>('openUrl', {'url': url});
  }

  static Future<void> downloadUrl({
    required String url,
    required String fileName,
  }) async {
    await _channel.invokeMethod<void>('downloadUrl', {
      'url': url,
      'fileName': fileName,
    });
  }
}

String fileNameFromUrl(String? url) {
  if (url == null || url.trim().isEmpty) return '-';

  final cleanUrl = url.split('?').first;
  final segments = cleanUrl
      .split('/')
      .where((part) => part.trim().isNotEmpty)
      .toList();
  final segment = segments.isEmpty ? null : segments.last;

  if (segment == null || segment.isEmpty) return '-';
  return Uri.decodeComponent(segment);
}
