import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../feature/auth/presentation/providers/auth_provider.dart';

class AuthRouterNotifier extends ChangeNotifier {
  void refresh() => notifyListeners();
}

final authRouterNotifierProvider = Provider<AuthRouterNotifier>((ref) {
  final notifier = AuthRouterNotifier();

  ref.listen(authNotifierProvider, (_, __) {
    notifier.refresh();
  });

  return notifier;
});