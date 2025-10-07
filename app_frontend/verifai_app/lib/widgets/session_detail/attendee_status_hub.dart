import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:verifai_app/logic/providers.dart';

class AttendeeStatusHub extends ConsumerWidget {
  final String sessionId;
  const AttendeeStatusHub({super.key, required this.sessionId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusAsync = ref.watch(attendeeStatusProvider(sessionId));

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Status Hub', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 24),
          statusAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, stack) => Text('Error: $err'),
            data: (status) => Card(
              child: ListTile(
                title: const Text('Your Current Status'),
                trailing: Chip(
                  label: Text(status.state),
                  backgroundColor: status.state == 'Satisfied'
                      ? Theme.of(context).colorScheme.secondary
                      : Colors.grey.shade700,
                  labelStyle: TextStyle(
                    color: status.state == 'Satisfied' ? Colors.black : Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text('Required Actions', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 16),
          // This would be dynamically populated based on the session's configuration
          Card(
            child: ListTile(
              title: const Text('Scan Session QR Code'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: () {
                // Navigate to the QR scanner
              },
            ),
          )
        ],
      ),
    );
  }
}