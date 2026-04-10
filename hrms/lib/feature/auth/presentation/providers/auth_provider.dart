import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../../../core/network/dio_client.dart';
import '../../../../core/utils/token_storage.dart';
import '../../data/datasources/auth_remote.dart';
import '../../data/repo/auth_repository.dart';
import 'auth_state.dart';

final authRemoteProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return AuthRemote( dio: dio, tokenStorage: ref.watch(tokenStorageProvider));
});
final authRepositoryProvider = Provider((ref) {
  final remote = ref.watch(authRemoteProvider);
  return AuthRepository(remote);
});

final authNotifierProvider = AsyncNotifierProvider<AuthNotifier, AuthState>((
    ) {
  return AuthNotifier();
});

class AuthNotifier extends AsyncNotifier<AuthState> {
  late final AuthRepository _repo ;
  late final TokenStorage _tokenStorage;
  @override
  FutureOr<AuthState> build() async {
    _repo = ref.watch(authRepositoryProvider);
    _tokenStorage = ref.watch(tokenStorageProvider);
    return AuthState.initial();
  }

  Future<void> checkAuth() async {
    state = const AsyncValue.loading();
    try {
      final token = await _tokenStorage.readAccessToken();
      if (token != null && token.isNotEmpty) {
        try{
          final user = await _repo.getCurrentUser();
          state = AsyncValue.data(AuthState.authenticated(user));
        } catch (e) {
          await _tokenStorage.clear();
          state = AsyncValue.data(AuthState.unauthenticated());
        }
      } else {
        await _tokenStorage.clear();
        state =  AsyncValue.data(AuthState.unauthenticated());
      }
    } catch (_) {
      await _tokenStorage.clear();
      state = AsyncValue.data(AuthState.unauthenticated());
    }
  }

  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final user = await _repo.login(email, password);
      state = AsyncValue.data(AuthState.authenticated(user));
    } catch (e) {
      state = AsyncValue.data(AuthState.failure(e.toString()));
    }
  }

  Future<void> register(String email, String password) async {
    state = const AsyncValue.loading();
    final enteredField = EnteredField(email: email, password: password, comfirmPassword: password);
    try {
      await _repo.register(email, password);
      state = AsyncValue.data(AuthState.otpRequired(enteredField));
    } catch (e) {
      state = AsyncValue.data(AuthState.failure(e.toString()));
    }
  }

  Future<void> verifyOtp(String email, String otp) async{
    print('Verifying OTP for email: $email with OTP: $otp');
    state = const AsyncValue.loading();

    try{
      final user = await _repo.verifyOtp(email, otp);
      state = AsyncValue.data(AuthState.authenticated(user));
    } catch(e){
      final enteredField = state.value?.enteredField;
      state = AsyncValue.data(AuthState(status: AuthStatus.otpRequired, message: e.toString(), enteredField: enteredField));
    }
  }

  Future<void> resendOtp() async{
    state = const AsyncValue.loading();
    final enteredField = state.value?.enteredField;
    try {
      await _repo.register(enteredField!.email, enteredField.password);
      state = AsyncValue.data(AuthState.otpRequired(enteredField));
    } catch (e) {
      final enteredField = state.value?.enteredField;
      state = AsyncValue.data(AuthState(status: AuthStatus.otpRequired, message: e.toString(), enteredField: enteredField));
    }
  }

  Future<bool> refreshToken() async {
    try {
      final success = await _repo.refreshToken();
      return success;
    } catch (e) {
      return false;
    }
  }
  Future<void> autoLogout() async {
    await _tokenStorage.clear();
    state = AsyncValue.data(AuthState.unauthenticated());
  }

  Future<void> closeDialog() async {
    // This method can be used to reset any error messages or states after showing a dialog
    if (state.value?.status == AuthStatus.unauthenticated && state.value?.message != null) {
      state = AsyncValue.data(AuthState.unauthenticated());
    }
  }

  void clearMessage() {
    final status = state.value?.status;
    state = AsyncValue.data(AuthState(status: status!));
  }

  Future<void> logout() async {
    state = const AsyncValue.loading();
    await _tokenStorage.clear();
    state = AsyncValue.data(AuthState.unauthenticated());
  }

  Future<void> otpToRegister() async {
    final enteredField = state.value?.enteredField;
    state = AsyncValue.data(AuthState(status: AuthStatus.unauthenticated, enteredField: enteredField));
  }
}