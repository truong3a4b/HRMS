import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/feature/auth/presentation/widgets/back_button.dart';

import '../../../../core/widget/app_snackbar.dart';
import '../../../../core/widget/custom_dialog.dart';
import '../providers/auth_provider.dart';
import '../providers/auth_state.dart';
import '../widgets/logo_section.dart';
import '../widgets/text_field.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  late final _emailController;
  late final _passwordController;
  late final _confirmPasswordController;

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void initState(){
    super.initState();
    final enteredField = ref.read(authNotifierProvider.notifier).state.value?.enteredField;

    _emailController = TextEditingController(text: enteredField?.email);
    _passwordController = TextEditingController(text: enteredField?.password);
    _confirmPasswordController = TextEditingController(text: enteredField?.comfirmPassword);

    ref.listenManual<AsyncValue<AuthState>>(authNotifierProvider, (
        previous,
        next,
        ) {
      next.whenOrNull(
        data: (state) {
          if (state.status == AuthStatus.unauthenticated &&
              state.message != null) {
            showErrorDialog(state.message!);
          }
        },
        error: (error, stackTrace) {
          showErrorDialog('Đăng ký thất bại. Vui lòng thử lại.');
        },
      );
    });
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) {
        return CustomDialog(
          message: message,
          type: "error",
          onClose: () {
            ref.read(authNotifierProvider.notifier).closeDialog();
          },
        );
      },
    );
  }
  //Check dữ liệu trước khi gửi
  String? validateEntry({
    required String email,
    required String password,
    required String confirmPassword,
  }) {
    if (email.trim().isEmpty) {
      return 'Email không được để trống';
    }

    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(email)) {
      return 'Email không hợp lệ';
    }

    if (password.trim().isEmpty) {
      return 'Mật khẩu không được để trống';
    }

    if (password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (confirmPassword.trim().isEmpty) {
      return 'Vui lòng xác nhận mật khẩu';
    }
    if (password != confirmPassword) {
      return 'Mật khẩu xác nhận không khớp';
    }

    return null; // hợp lệ
  }

  @override
  Widget build(BuildContext context) {
    const primaryBlue = Color(0xFF0E67B2);
    const lightBackground = Color(0xFFF4F4F4);
    const dividerGray = Color(0xFFD9D9D9);

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
                    bottomLeft: Radius.circular(28),
                    bottomRight: Radius.circular(28),
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

              // Back Button
              Positioned(
                top: MediaQuery.of(context).padding.top + 12,
                left: 18,
                child: BackButtonCustom(onTap: (){
                  final canPop = context.canPop();
                  if (canPop) {
                    context.pop();
                  }else{
                    context.go('/login');
                  }
                }),
              ),

              // Logo Section
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

              // Form Container
              Positioned.fill(
                top: 160,
                child: Container(
                  decoration: const BoxDecoration(
                    color: lightBackground,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(20),
                      topRight: Radius.circular(20),
                    ),
                  ),
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(18, 18, 18, 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: 2),
                        const Center(
                          child: Text(
                            'Đăng ký',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF333333),
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Email Field
                        AppTextField(
                          controller: _emailController,
                          hintText: 'Email',
                          keyboardType: TextInputType.emailAddress,
                        ),
                        const SizedBox(height: 20),

                        // Password Field
                        AppTextField(
                          controller: _passwordController,
                          hintText: 'Mật khẩu',
                          obscureText: _obscurePassword,
                          suffixIcon: IconButton(
                            onPressed: () {
                              setState(() {
                                _obscurePassword = !_obscurePassword;
                              });
                            },
                            icon: Icon(
                              _obscurePassword
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                              color: const Color(0xFF9E9E9E),
                              size: 20,
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Confirm Password Field
                        AppTextField(
                          controller: _confirmPasswordController,
                          hintText: 'Nhập lại mật khẩu',
                          obscureText: _obscureConfirmPassword,
                          suffixIcon: IconButton(
                            onPressed: () {
                              setState(() {
                                _obscureConfirmPassword =
                                    !_obscureConfirmPassword;
                              });
                            },
                            icon: Icon(
                              _obscureConfirmPassword
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                              color: const Color(0xFF9E9E9E),
                              size: 20,
                            ),
                          ),
                        ),
                        const SizedBox(height: 28),

                        // Register Button
                        SizedBox(
                          height: 50,
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: isLoading
                                ? null
                                : () async {
                                    FocusScope.of(context).unfocus();

                                    final email = _emailController.text.trim();
                                    final password = _passwordController.text
                                        .trim();
                                    final confirmPassword =
                                        _confirmPasswordController.text.trim();
                                    final validationMessage = validateEntry(
                                      email: email,
                                      password: password,
                                      confirmPassword: confirmPassword,
                                    );
                                    if (validationMessage != null) {
                                      AppSnackbar.showError(
                                        context,
                                        validationMessage,
                                      );
                                      return;
                                    }
                                    await ref
                                        .read(authNotifierProvider.notifier)
                                        .register(email, password);
                                  },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: primaryBlue,
                              foregroundColor: Colors.white,
                              elevation: 3,
                              shadowColor: Colors.black26,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            child: isLoading
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.white,
                                      ),
                                    ),
                                  )
                                : const Text(
                                    'Tiếp tục',
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                          ),
                        ),

                        const SizedBox(height: 22),

                        const Row(
                          children: [
                            Expanded(
                              child: Divider(thickness: 1, color: dividerGray),
                            ),
                            Padding(
                              padding: EdgeInsets.symmetric(horizontal: 12),
                              child: Text(
                                'Hoặc',
                                style: TextStyle(
                                  color: Color(0xFF9A9A9A),
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            Expanded(
                              child: Divider(thickness: 1, color: dividerGray),
                            ),
                          ],
                        ),

                        const SizedBox(height: 22),

                        // Google Sign-In Button
                        SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: OutlinedButton(
                            onPressed: () {},
                            style: OutlinedButton.styleFrom(
                              backgroundColor: const Color(0xFFD4E1ED),
                              side: BorderSide.none,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Image.asset(
                                  'assets/images/google.png',
                                  width: 18,
                                  height: 18,
                                  fit: BoxFit.contain,
                                ),
                                const SizedBox(width: 8),
                                const Flexible(
                                  child: Text(
                                    'Tiếp tục với Google',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      color: Color(0xFF333333),
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 28),
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
