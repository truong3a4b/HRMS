import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/core/widget/app_primary_button.dart';

import '../../../../core/widget/app_snackbar.dart';
import '../../../../core/widget/custom_dialog.dart';
import '../providers/auth_provider.dart';
import '../providers/auth_state.dart';
import '../widgets/logo_section.dart';
import '../../../../core/widget/text_field.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscureText = true;

  late final ProviderSubscription<AsyncValue<AuthState>> _sub;

  @override
  void initState() {
    super.initState();
    _sub = ref.listenManual<AsyncValue<AuthState>>(authNotifierProvider, (
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
          showErrorDialog('Đăng nhập thất bại. Vui lòng thử lại.');
        },
      );
    });
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _sub.close();
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
  String? validateEmailAndPassword({
    required String email,
    required String password,
  }) {
    if (email.trim().isEmpty) {
      return 'Email không được để trống';
    }

    if (password.trim().isEmpty) {
      return 'Mật khẩu không được để trống';
    }

    return null; // hợp lệ
  }

  //ham login
  void login() async {
    FocusScope.of(context).unfocus();

    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    final validationMessage = validateEmailAndPassword(
      email: email,
      password: password,
    );
    if (validationMessage != null) {
      AppSnackbar.showError(context, validationMessage);
      return;
    }
    await ref.read(authNotifierProvider.notifier).login(email, password);
  }

  @override
  Widget build(BuildContext context) {
    const primaryBlue = Color(0xFF0E67B2);
    const lightBackground = Color(0xFFF4F4F4);
    const textGray = Color(0xFF7A7A7A);
    const dividerGray = Color(0xFFD9D9D9);

    final authAsync = ref.watch(authNotifierProvider);

    final isLoading = authAsync.isLoading;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            Expanded(
              child: Stack(
                children: [
                  //background
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

                  //form
                  Positioned.fill(
                    top: 160,
                    child: Container(
                      decoration: const BoxDecoration(
                        color: lightBackground,
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(28),
                          topRight: Radius.circular(28),
                        ),
                      ),
                      child: LayoutBuilder(
                        builder: (context, constraints) {
                          return SingleChildScrollView(
                            padding: const EdgeInsets.fromLTRB(18, 18, 18, 24),
                            child: ConstrainedBox(
                              //đảm bảo scroll chỉ xảy ra khi nội dung vượt quá chiều cao, tránh scroll khi ít nội dung
                              constraints: BoxConstraints(
                                minHeight: constraints.maxHeight - 20,
                              ),
                              child: IntrinsicHeight(
                                //đảm bảo nội dung luôn chiếm đủ chiều cao, tránh bị co lại khi ít nội dung
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.stretch,
                                  children: [
                                    const SizedBox(height: 4),
                                    const Center(
                                      child: Text(
                                        'Đăng nhập',
                                        style: TextStyle(
                                          fontSize: 20,
                                          fontWeight: FontWeight.w800,
                                          color: Color(0xFF333333),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 24),
                                    //email
                                    AppTextField(
                                      controller: _emailController,
                                      hintText: 'Email',
                                      keyboardType: TextInputType.emailAddress,
                                    ),
                                    const SizedBox(height: 20),
                                    //password
                                    AppTextField(
                                      controller: _passwordController,
                                      hintText: 'Mật khẩu',
                                      obscureText: _obscureText,
                                      suffixIcon: IconButton(
                                        onPressed: () {
                                          setState(() {
                                            _obscureText = !_obscureText;
                                          });
                                        },
                                        icon: Icon(
                                          _obscureText
                                              ? Icons.visibility_off_outlined
                                              : Icons.visibility_outlined,
                                          color: const Color(0xFF9E9E9E),
                                          size: 20,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 28),

                                    //login button
                                    SizedBox(
                                      height: 50,
                                      child: AppPrimaryButton(
                                        onPressed: login,
                                        isLoading: isLoading,
                                        text: 'Đăng nhập',
                                      ),
                                    ),
                                    const SizedBox(height: 18),

                                    //forgot password link
                                    Center(
                                      child: TextButton(
                                        onPressed: () {},
                                        style: TextButton.styleFrom(
                                          foregroundColor: textGray,
                                          padding: EdgeInsets.zero,
                                        ),
                                        child: const Text(
                                          'Quên mật khẩu',
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 14),

                                    const Row(
                                      children: [
                                        Expanded(
                                          child: Divider(
                                            thickness: 1,
                                            color: dividerGray,
                                          ),
                                        ),
                                        Padding(
                                          padding: EdgeInsets.symmetric(
                                            horizontal: 12,
                                          ),
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
                                          child: Divider(
                                            thickness: 1,
                                            color: dividerGray,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 22),

                                    //google login button
                                    SizedBox(
                                      height: 50,
                                      width: double.infinity,
                                      child: OutlinedButton(
                                        onPressed: () {},
                                        style: OutlinedButton.styleFrom(
                                          backgroundColor: const Color(
                                            0xFFD4E1ED,
                                          ),
                                          side: BorderSide.none,
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(
                                              8,
                                            ),
                                          ),
                                        ),
                                        child: Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            Image.asset(
                                              'assets/images/google.png',
                                              width: 18,
                                              height: 18,
                                            ),
                                            const SizedBox(width: 8),
                                            const Flexible(
                                              child: Text(
                                                'Tiếp tục với Google',
                                                overflow: TextOverflow.ellipsis,
                                                maxLines: 1,
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

                                    const Spacer(),
                                    const SizedBox(height: 28),

                                    //register link
                                    Center(
                                      child: RichText(
                                        text: TextSpan(
                                          style: const TextStyle(
                                            fontSize: 14,
                                            color: Color(0xFF4A4A4A),
                                          ),
                                          children: [
                                            const TextSpan(
                                              text: 'Bạn chưa có tài khoản? ',
                                            ),
                                            WidgetSpan(
                                              alignment:
                                                  PlaceholderAlignment.middle,
                                              child: GestureDetector(
                                                onTap: () {
                                                  //navigate to register screen
                                                  context.go('/register');
                                                },
                                                child: const Text(
                                                  'Đăng ký ngay',
                                                  style: TextStyle(
                                                    color: primaryBlue,
                                                    fontWeight: FontWeight.w700,
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
