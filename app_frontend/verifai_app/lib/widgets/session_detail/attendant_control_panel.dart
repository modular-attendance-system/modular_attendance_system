import 'package:flutter/material.dart';
import 'package:verifai_app/data/models/session.dart';

class AttendantControlPanel extends StatelessWidget {
  final Session session;
  const AttendantControlPanel({super.key, required this.session});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Control Panel', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 16),
          // Add attendant-specific controls here
        ],
      ),
    );
  }
}