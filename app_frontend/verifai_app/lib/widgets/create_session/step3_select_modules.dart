import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:verifai_app/logic/providers.dart';

class Step3SelectModules extends ConsumerWidget {
  const Step3SelectModules({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final available = ref.watch(availableShieldsProvider);
    final selected = ref.watch(createSessionControllerProvider).selectedShields;
    final requiredProps = ref.watch(createSessionControllerProvider).requiredProperties;

    // This logic can be expanded based on manifest dependencies
    bool canSelectFaceRecognition = requiredProps.contains('prop_face_encodings');

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        children: [
          Text('Step 3: Select Modules',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text('Choose the Shields (validation methods) for this session.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey.shade400)),
          const SizedBox(height: 32),
          ...available.entries.map((entry) {
            bool isEnabled = true;
            String? subtitle;
            if (entry.key == 'maas.shield.face_recognition') {
              isEnabled = canSelectFaceRecognition;
              if(!isEnabled) subtitle = 'Requires "Face Encodings" property from Step 2';
            }
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: CheckboxListTile(
                title: Text(entry.value),
                subtitle: subtitle != null ? Text(subtitle, style: const TextStyle(color: Colors.orangeAccent)) : null,
                value: selected.contains(entry.key),
                onChanged: isEnabled ? (_) => ref.read(createSessionControllerProvider.notifier).toggleShield(entry.key) : null,
              ),
            );
          }),
        ],
      ),
    );
  }
}