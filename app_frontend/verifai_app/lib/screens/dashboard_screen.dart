import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:verifai_app/logic/providers.dart';
import 'package:verifai_app/widgets/session_card.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // This provider will fetch the user's sessions from your backend.
    final mySessionsAsyncValue = ref.watch(mySessionsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Sessions'),
        actions: [
          IconButton(
            tooltip: 'Log Out',
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
          ),
        ],
      ),
      // The .when method from Riverpod is perfect for handling loading and error states.
      body: mySessionsAsyncValue.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text('Failed to load sessions: ${err.toString()}', textAlign: TextAlign.center),
          ),
        ),
        data: (sessions) {
          if (sessions.isEmpty) {
            return const Center(
              child: Text(
                'You are not part of any sessions yet.\nTap the + button to create one.',
                textAlign: TextAlign.center,
              ),
            );
          }
          // RefreshIndicator allows the user to pull down to refresh the list.
          return RefreshIndicator(
            onRefresh: () => ref.refresh(mySessionsProvider.future),
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                maxCrossAxisExtent: 400,
                childAspectRatio: 1.3,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
              ),
              itemCount: sessions.length,
              itemBuilder: (context, index) => SessionCard(session: sessions[index]),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/create-session'),
        label: const Text('Create New Session'),
        icon: const Icon(Icons.add),
      ),
    );
  }
}