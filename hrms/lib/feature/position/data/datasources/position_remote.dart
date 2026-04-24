import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/dio_client.dart';

class PositionRemote {
  final Dio dio;

  PositionRemote(this.dio);
}

final positionRemoteProvider = Provider<PositionRemote>((ref) {
  final dio = ref.watch(dioProvider);
  return PositionRemote(dio);
});