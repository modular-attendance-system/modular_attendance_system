import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:verifai_app/data/models/session.dart';

class SessionCard extends StatelessWidget {
  final Session session;
  const SessionCard({super.key, required this.session});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final roleColor = session.primaryRole == 'Attendant'
        ? theme.colorScheme.secondary
        : theme.primaryColor;

    return Card(
      child: InkWell(
        onTap: () => context.push('/session/${session.sessionId}'),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Hero(
                    tag: 'status-dot-${session.sessionId}',
                    child: Icon(Icons.circle,
                        size: 12,
                        color: session.isActive
                            ? theme.colorScheme.secondary
                            : Colors.grey),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Hero(
                      tag: 'session-title-${session.sessionId}',
                      child: Material(
                        color: Colors.transparent,
                        child: Text(session.name,
                            style: const TextStyle(
                                fontSize: 18, fontWeight: FontWeight.bold),
                            overflow: TextOverflow.ellipsis),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Chip(
                label: Text(session.primaryRole),
                backgroundColor: roleColor.withOpacity(0.2),
                labelStyle: TextStyle(color: roleColor, fontWeight: FontWeight.bold),
                padding: const EdgeInsets.symmetric(horizontal: 8),
              ),
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }
}