import 'package:cookie_jar/cookie_jar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';

import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/utils/token_storage.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final appDocDir = await getApplicationDocumentsDirectory();
  //Lấy đường dẫn lưu cookie trên điện thoại
  final String path = "${appDocDir.path}/.cookies/";
  //Khởi tạo PersistCookieJar
  final persistCookieJar = PersistCookieJar(
    storage: FileStorage(path),
    ignoreExpires: false, // Tự động xóa cookie hết hạn
  );
  runApp(
    ProviderScope(
      retry: (retryCount, error) => null,
      overrides: [cookieJarProvider.overrideWithValue(persistCookieJar)],
      child: const MyApp(),
    ),
  );
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {

    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'HRMS',
      debugShowCheckedModeBanner: false,
      routerConfig: router,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.lightTheme,
      themeMode: ThemeMode.system,
    );
  }
}
