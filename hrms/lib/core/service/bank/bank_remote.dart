import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/network/dio_client.dart';

class BankRemote {
  final Dio dio;

  BankRemote(this.dio);
}

final bankRemoteProvider = Provider<BankRemote>((ref) {
  final dio = ref.watch(baseDioProvider);

  return BankRemote(dio);
});