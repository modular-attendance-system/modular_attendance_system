import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:verifai_app/data/models/session_config.dart';
import 'package:verifai_app/logic/providers.dart';

class Step5AggregationLogic extends ConsumerWidget {
  const Step5AggregationLogic({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final logic = ref.watch(createSessionControllerProvider).aggregationLogic;
    final notifier = ref.read(createSessionControllerProvider.notifier);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        children: [
          Text('Step 5: Define Aggregation Logic',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text('Choose how multiple Shield results are combined into a final status.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey.shade400)),
          const SizedBox(height: 32),
          Card(
            child: RadioListTile<AggregationLogic>(
              title: const Text('Require ALL Shields'),
              subtitle: const Text('Strictest. All selected shields must be "Satisfied".'),
              value: AggregationLogic.requireAll,
              groupValue: logic,
              onChanged: (v) => notifier.setAggregationLogic(v!),
            ),
          ),
          Card(
            child: RadioListTile<AggregationLogic>(
              title: const Text('Require ANY Shield'),
              subtitle: const Text('Lenient. At least one shield must be "Satisfied".'),
              value: AggregationLogic.requireAny,
              groupValue: logic,
              onChanged: (v) => notifier.setAggregationLogic(v!),
            ),
          ),
        ],
      ),
    );
  }
}