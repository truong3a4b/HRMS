import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/feature/auth/presentation/widgets/back_button.dart';

import '../../../../core/widget/app_confirm_dialog.dart';
import '../../../../core/widget/app_primary_button.dart';
import '../../../../core/widget/app_snackbar.dart';
import '../providers/auth_provider.dart';
import '../providers/auth_state.dart';
import '../widgets/logo_section.dart';

class VerifyOtpScreen extends ConsumerStatefulWidget {
  const VerifyOtpScreen({super.key});

  @override
  ConsumerState<VerifyOtpScreen> createState() => _VerifyOtpScreenState();
}

class _VerifyOtpScreenState extends ConsumerState<VerifyOtpScreen> {
  late final List<TextEditingController> _controllers;
  late final List<FocusNode> _focusNodes;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(6, (_) => TextEditingController());
    _focusNodes = List.generate(6, (_) => FocusNode());
    ref.listenManual<AsyncValue<AuthState>>(authNotifierProvider, (
      previous,
      next,
    ) {
      final prevState = previous?.value;
      final nextState = next.value;

      if (nextState == null) return;

      // chỉ show khi message thay đổi
      if (nextState.message != null &&
          nextState.message != prevState?.message) {
        if (mounted) {
          AppSnackbar.showError(context, nextState.message!);
        }
      }
    });
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  void _onOtpChanged(String value, int index) {
    if (value.isNotEmpty) {
      if (index < _focusNodes.length - 1) {
        _focusNodes[index + 1].requestFocus();
      } else {
        _focusNodes[index].unfocus();
      }
    }
  }

  void _onBackspace(int index) {
    if (_controllers[index].text.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
      _controllers[index - 1].clear();
    }
  }

  String? _validateOtp(String otp) {
    if (otp.length < 6) {
      return 'Vui lòng nhập đủ 6 chữ số';
    }
    return null;
  }

  void _handleResendOtp(String email) {
    final isLoading = ref.watch(authNotifierProvider).isLoading;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AppConfirmDialog(
          title: 'Gửi lại mã xác thực',
          message:
              'Chúng tôi sẽ gửi lại mã xác thực đến địa chỉ email $email. Vui lòng truy cập email để lấy mã xác thực',
          isLoading: isLoading,
          onCancel: () => Navigator.pop(context),
          onConfirm: () {
            ref.read(authNotifierProvider.notifier).resendOtp();
            context.pop();
          },
        );
      },
    );
  }

  void _handleConfirm(String email) async {
    final otp = _controllers.map((e) => e.text).join();
    final validationMessage = _validateOtp(otp);
    if (validationMessage != null) {
      AppSnackbar.showError(context, validationMessage);
      return;
    }
    await ref.read(authNotifierProvider.notifier).verifyOtp(email, otp);
  }

  @override
  Widget build(BuildContext context) {
    const pageBackground = Color(0xFFF5F5F5);

    final authAsync = ref.watch(authNotifierProvider);
    final isLoading = authAsync.isLoading;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        statusBarBrightness: Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          top: false,
          child: Stack(
            children: [
              Container(
                height: 230,
                width: double.infinity,
                decoration: const BoxDecoration(
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(20),
                    bottomRight: Radius.circular(20),
                  ),
                  gradient: LinearGradient(
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                    colors: [
                      Color(0xFF4E7FF4),
                      Color(0xFF2448AE),
                      Color(0xFF6C11CD),
                    ],
                    stops: [0.0, 0.6, 1.0],
                  ),
                ),
              ),

              Positioned(
                top: MediaQuery.of(context).padding.top + 12,
                left: 18,
                child: BackButtonCustom(
                  onTap: () {
                    final canPop = context.canPop();
                    if (canPop) {
                      context.pop();
                    } else {
                      ref.read(authNotifierProvider.notifier).otpToRegister();
                    }
                  },
                ),
              ),

              Align(
                alignment: Alignment.topCenter,
                child: Padding(
                  padding: const EdgeInsets.only(top: 82),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: const [LogoSection()],
                  ),
                ),
              ),

              Positioned.fill(
                top: 178,
                child: Container(
                  decoration: const BoxDecoration(
                    color: pageBackground,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(34),
                      topRight: Radius.circular(34),
                    ),
                  ),
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(18, 18, 18, 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Center(
                          child: Text(
                            'Nhập mã xác thực',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF333333),
                            ),
                          ),
                        ),
                        const SizedBox(height: 18),

                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          child: Text.rich(
                            TextSpan(
                              style: const TextStyle(
                                fontSize: 14,
                                color: Color(0xFF333333),
                                height: 1.45,
                              ),
                              children: [
                                const TextSpan(
                                  text: 'Mã xác thực được gửi về email ',
                                ),
                                TextSpan(
                                  text:
                                      authAsync.value?.enteredField?.email ??
                                      '',
                                  style: const TextStyle(
                                    color: Color(0xFF005BAA),
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),

                        const SizedBox(height: 16),

                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF6EDE2),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFFE9D3B5)),
                          ),
                          child: const Text.rich(
                            TextSpan(
                              style: TextStyle(
                                fontSize: 14,
                                color: Color(0xFF4B4B4B),
                                height: 1.45,
                              ),
                              children: [
                                TextSpan(
                                  text: 'Nếu không thấy email ',
                                  style: TextStyle(
                                    color: Color(0xFFFF7A00),
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                TextSpan(
                                  text:
                                      'bạn hãy kiểm tra mục thư rác và đánh dấu không phải là spam',
                                ),
                              ],
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),

                        const SizedBox(height: 28),

                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: List.generate(
                            6,
                            (index) => _OtpBox(
                              controller: _controllers[index],
                              focusNode: _focusNodes[index],
                              onChanged: (value) => _onOtpChanged(value, index),
                              onBackspace: () => _onBackspace(index),
                            ),
                          ),
                        ),

                        const SizedBox(height: 30),

                        Center(
                          child: TextButton(
                            onPressed: () {
                              _handleResendOtp(
                                authAsync.value?.enteredField?.email ?? '',
                              );
                            },
                            style: TextButton.styleFrom(
                              foregroundColor: const Color(0xFF005BAA),
                              padding: EdgeInsets.zero,
                            ),
                            child: const Text(
                              'Gửi lại mã xác thực',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 34),

                        //Nút xác thực
                        SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: AppPrimaryButton(
                            onPressed: () async {
                              final email =
                                  authAsync.value?.enteredField?.email ?? '';
                              _handleConfirm(email);
                            },
                            isLoading: isLoading,
                            text: 'Xác thực',
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _OtpBox extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final ValueChanged<String> onChanged;
  final VoidCallback onBackspace;

  const _OtpBox({
    required this.controller,
    required this.focusNode,
    required this.onChanged,
    required this.onBackspace,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 46,
      height: 52,
      child: KeyboardListener(
        focusNode: FocusNode(),
        onKeyEvent: (event) {
          if (event is KeyDownEvent &&
              event.logicalKey == LogicalKeyboardKey.backspace) {
            onBackspace();
          }
        },
        child: TextField(
          controller: controller,
          focusNode: focusNode,
          textAlign: TextAlign.center,
          maxLength: 1,
          keyboardType: TextInputType.number,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: Color(0xFF333333),
          ),
          decoration: InputDecoration(
            counterText: '',
            filled: true,
            fillColor: Colors.transparent,
            contentPadding: EdgeInsets.zero,
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6),
              borderSide: const BorderSide(color: Color(0xFFD8D8D8), width: 1),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6),
              borderSide: const BorderSide(
                color: Color(0xFF156FB8),
                width: 1.4,
              ),
            ),
          ),
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          onChanged: onChanged,
        ),
      ),
    );
  }
}
