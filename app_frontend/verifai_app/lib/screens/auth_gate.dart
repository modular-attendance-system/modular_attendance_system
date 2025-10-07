import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:verifai_app/logic/controllers/auth_controller.dart';
import 'package:verifai_app/logic/providers.dart';
import 'package:verifai_app/screens/dashboard_screen.dart';
import 'package:verifai_app/screens/login_screen.dart';

// This widget acts as a gate, showing the correct screen based on auth state.
class AuthGate extends ConsumerWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);

    switch (authState.status) {
      case AuthStatus.authenticated:
        return const DashboardScreen();
      case AuthStatus.unauthenticated:
        return const LoginScreen();
      case AuthStatus.unknown:
      default:
        // Show a loading spinner while checking for a token.
        return const Scaffold(
          body: Center(child: CircularProgressIndicator()),
        );
    }
  }
}