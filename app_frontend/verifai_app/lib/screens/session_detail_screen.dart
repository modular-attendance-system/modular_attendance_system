import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:verifai_app/logic/providers.dart';
import 'package:verifai_app/widgets/session_detail/attendant_control_panel.dart';
import 'package:verifai_app/widgets/session_detail/attendee_status_hub.dart';


class SessionDetailScreen extends ConsumerWidget {
  final String sessionId;
  const SessionDetailScreen({super.key, required this.sessionId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessionDetailAsync = ref.watch(sessionDetailProvider(sessionId));

    return Scaffold(
      body: sessionDetailAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
        data: (session) {
          final isAttendant = session.primaryRole == 'Attendant';
          
          return CustomScrollView(
            slivers: [
              SliverAppBar(
                title: Hero(
                  tag: 'session-title-${session.sessionId}',
                  child: Material(
                    color: Colors.transparent,
                    child: Text(session.name),
                  ),
                ),
                pinned: true,
                actions: [
                  if(isAttendant)
                    TextButton(onPressed: () {}, child: const Text('Edit Rules')),
                ],
              ),
              SliverToBoxAdapter(
                child: isAttendant
                    ? AttendantControlPanel(session: session)
                    : AttendeeStatusHub(sessionId: sessionId),
              ),
            ],
          );
        },
      ),
    );
  }
}