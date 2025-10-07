import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:verifai_app/logic/providers.dart';

class Step4ConfigureModules extends ConsumerWidget {
  const Step4ConfigureModules({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selected = ref.watch(createSessionControllerProvider).selectedShields;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        children: [
          Text('Step 4: Configure Modules',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text('Set the rules for each activated module. (Not yet implemented)',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey.shade400)),
          const SizedBox(height: 32),
          if (selected.isEmpty)
            const Text('No modules selected.')
          else
            ...selected.map((shieldId) {
              final moduleName = shieldId.split('.').last.replaceAll('_', ' ');
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  title: Text('Configure ${moduleName[0].toUpperCase()}${moduleName.substring(1)}'),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    // This is where we would navigate to the WebView screen
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Configuration for $moduleName is not yet implemented.')),
                    );
                  },
                ),
              );
            }),
        ],
      ),
    );
  }
}