import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:verifai_app/config/router.dart';
import 'package:verifai_app/config/theme.dart';

void main() {
  // ProviderScope is what makes Riverpod work.
  // It holds the state of all our application's providers.
  runApp(const ProviderScope(child: VerifAIApp()));
}

class VerifAIApp extends ConsumerWidget {
  const VerifAIApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // We use MaterialApp.router to integrate with go_router.
    // It reads the router configuration from our routerProvider.
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'VerifAI',
      theme: AppTheme.darkTheme,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}