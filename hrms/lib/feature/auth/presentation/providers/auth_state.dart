import '../../domain/entities/user.dart';

enum AuthStatus{
  initial,
  authenticated,
  unauthenticated,
  otpRequired,
}

class EnteredField{
  final String email;
  final String password;
  final String? comfirmPassword;

  EnteredField({required this.email , required this.password, this.comfirmPassword}) ;
}

class AuthState {
  final AuthStatus status;
  final User? user;
  final String? message;
  final EnteredField? enteredField;

  AuthState({required this.status,this.user, this.message, this.enteredField});

  factory AuthState.initial() {
    return AuthState(status: AuthStatus.initial);
  }

  factory AuthState.authenticated(User user) {
    return AuthState(status: AuthStatus.authenticated, user: user);
  }

  factory AuthState.unauthenticated() {
    return AuthState(status: AuthStatus.unauthenticated);
  }


  factory AuthState.otpRequired(EnteredField enteredField) {
    return AuthState(status: AuthStatus.otpRequired, enteredField: enteredField);
  }

  factory AuthState.failure(String message) {
    return AuthState(status: AuthStatus.unauthenticated, message: message);
  }

}