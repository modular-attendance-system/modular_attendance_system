import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:verifai_app/logic/controllers/auth_controller.dart';
import 'package:verifai_app/logic/providers.dart';
import 'package:verifai_app/screens/auth_gate.dart';
import 'package:verifai_app/screens/create_session_screen.dart';
import 'package:verifai_app/screens/dashboard_screen.dart';
import 'package:verifai_app/screens/login_screen.dart';
import 'package:verifai_app/screens/module_view_screen.dart';
import 'package:verifai_app/screens/register_screen.dart';
import 'package:verifai_app/screens/session_detail_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authControllerProvider);

  return GoRouter(
    initialLocation: '/login',
    refreshListenable:
        GoRouterRefreshStream(ref.read(authControllerProvider.notifier).stream),
    redirect: (BuildContext context, GoRouterState state) {
      final isAuthenticated = authState.status == AuthStatus.authenticated;
      final isLoggingIn =
          state.matchedLocation == '/login' || state.matchedLocation == '/register';

      if (!isAuthenticated) {
        return isLoggingIn ? null : '/login';
      }
      if (isLoggingIn) {
        return '/dashboard';
      }
      return null;
    },
    routes: [
      GoRoute(path: '/', builder: (context, state) => const AuthGate()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(path: '/register', builder: (context, state) => const RegisterScreen()),
      GoRoute(path: '/dashboard', builder: (context, state) => const DashboardScreen()),
      GoRoute(path: '/create-session', builder: (context, state) => const CreateSessionScreen()),
      GoRoute(
        path: '/session/:sessionId',
        builder: (context, state) {
          final sessionId = state.pathParameters['sessionId']!;
          return SessionDetailScreen(sessionId: sessionId);
        },
      ),
      GoRoute(
        path: '/module/:moduleId',
        builder: (context, state) {
          final moduleId = state.pathParameters['moduleId']!;
          String title = 'Module';
          String? url;

          // THE FIX IS HERE: Safely check and extract the arguments.
          if (state.extra is Map<String, String>) {
            final args = state.extra as Map<String, String>;
            title = args['title'] ?? 'Module';
            url = args['url'];
          }

          return ModuleViewScreen(
            moduleId: moduleId,
            title: title,
            url: url, // Pass the potentially null URL to the screen
          );
        },
      ),
    ],
  );
});

class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    _subscription = stream.asBroadcastStream().listen((_) => notifyListeners());
  }
  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}