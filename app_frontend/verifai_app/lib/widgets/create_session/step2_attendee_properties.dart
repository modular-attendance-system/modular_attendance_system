import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:verifai_app/logic/providers.dart';

class Step2AttendeeProperties extends ConsumerWidget {
  const Step2AttendeeProperties({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final available = ref.watch(availablePropertiesProvider);
    final selected = ref.watch(createSessionControllerProvider).requiredProperties;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        children: [
          Text('Step 2: Required Attendee Properties',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text('Select the information attendees must provide to join this session.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey.shade400)),
          const SizedBox(height: 32),
          ...available.entries.map((entry) {
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: CheckboxListTile(
                title: Text(entry.value),
                value: selected.contains(entry.key),
                onChanged: (_) => ref.read(createSessionControllerProvider.notifier).toggleProperty(entry.key),
              ),
            );
          }),
        ],
      ),
    );
  }
}