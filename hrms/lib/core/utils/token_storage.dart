import 'package:cookie_jar/cookie_jar.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';



class TokenStorage {
  static const _accessTokenKey = 'accessToken';

  final FlutterSecureStorage storage;
  final PersistCookieJar cookieJar;
  TokenStorage(this.storage, this.cookieJar);

  Future<void> saveAccessToken(String token) async {
  await storage.write(key: _accessTokenKey, value: token);
  }

  Future<String?> readAccessToken() async {
  return storage.read(key: _accessTokenKey);
  }

  Future<void> clear() async {
  await storage.delete(key: _accessTokenKey);
  try {
    await cookieJar.deleteAll();
  } catch (e) {
    debugPrint('Delete cookies skipped: $e');
  }
  }

}
final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});
final cookieJarProvider = Provider<PersistCookieJar>((ref) {
  throw UnimplementedError(); // Sẽ được override ở main
});
final tokenStorageProvider = Provider<TokenStorage>((ref) {
  return TokenStorage(ref.read(secureStorageProvider), ref.read(cookieJarProvider));
});
