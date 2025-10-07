import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:verifai_app/data/repositories/auth_repository.dart';

// Represents the authentication state of the application.
class AuthState {
  final AuthStatus status;
  final String? errorMessage;

  AuthState({required this.status, this.errorMessage});

  AuthState copyWith({AuthStatus? status, String? errorMessage}) {
    return AuthState(
      status: status ?? this.status,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

enum AuthStatus { unknown, authenticated, unauthenticated }

// Manages the application's authentication state.
class AuthController extends StateNotifier<AuthState> {
  final AuthRepository _authRepository;

  AuthController(this._authRepository)
      : super(AuthState(status: AuthStatus.unknown)) {
    _init();
  }

  Future<void> _init() async {
    final token = await _authRepository.getToken();
    state = token != null
        ? AuthState(status: AuthStatus.authenticated)
        : AuthState(status: AuthStatus.unauthenticated);
  }

  Future<void> login(String email, String password) async {
    await _authRepository.login(email, password);
    state = AuthState(status: AuthStatus.authenticated);
  }

  Future<void> logout() async {
    await _authRepository.logout();
    state = AuthState(status: AuthStatus.unauthenticated);
  }
}