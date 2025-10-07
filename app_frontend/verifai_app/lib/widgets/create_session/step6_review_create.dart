import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:verifai_app/logic/providers.dart';

class Step6Review extends ConsumerWidget {
  const Step6Review({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(createSessionControllerProvider);
    final properties = ref.watch(availablePropertiesProvider);
    final shields = ref.watch(availableShieldsProvider);

    String formatDateTime(DateTime? dt) {
      if (dt == null) return 'Not Set';
      return DateFormat('MM/dd/yyyy hh:mm a').format(dt);
    }
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Text('Step 6: Review & Create',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 32),
          _buildReviewCard(context, 'Session Name', config.name),
          _buildReviewCard(context, 'Start Time', formatDateTime(config.startTime)),
          _buildReviewCard(context, 'End Time', formatDateTime(config.endTime)),
          _buildReviewCard(
            context,
            'Required Properties',
            config.requiredProperties.map((id) => properties[id]!).join(', '),
          ),
          _buildReviewCard(
            context,
            'Active Shields',
            config.selectedShields.map((id) => shields[id]!).join(', '),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewCard(BuildContext context, String title, String value) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(title, style: TextStyle(color: Colors.grey.shade400)),
        subtitle: Text(value.isEmpty ? 'None' : value, style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontSize: 16)),
      ),
    );
  }
}