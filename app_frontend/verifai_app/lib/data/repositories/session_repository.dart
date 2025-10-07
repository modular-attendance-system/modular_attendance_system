import 'package:verifai_app/api/sessions_api.dart';
import 'package:verifai_app/data/models/attendee_status.dart';
import 'package:verifai_app/data/models/session.dart';
import 'package:verifai_app/data/models/session_config.dart';

/// A repository that provides a clean API for session-related data operations.
class SessionRepository {
  final SessionsApi _sessionsApi;
  SessionRepository(this._sessionsApi);

  Future<List<Session>> getMySessions() async {
    final List<dynamic> sessionData = await _sessionsApi.getMySessions();
    return sessionData.map((json) => Session.fromJson(json)).toList();
  }

  Future<Session> getSessionById(String sessionId) async {
    final sessionData = await _sessionsApi.getSessionById(sessionId);
    return Session.fromJson(sessionData);
  }
  
  Future<AttendeeStatus> getAttendeeStatus(String sessionId) async {
    final statusData = await _sessionsApi.getAttendeeStatus(sessionId);
    return AttendeeStatus.fromJson(statusData);
  }

  // Future<void> submitQrCode(String sessionId, String qrData) async {
  //   await _sessionsApi.submitQrCode(sessionId, qrData);
  // }

  Future<void> createSession(SessionConfig config) async {
    // This Map must match the format expected by your backend's `createSession` endpoint.
    final sessionData = {
      'name': config.name,
      'description': config.description,
      'startTime': config.startTime?.toIso8601String(),
      'endTime': config.endTime?.toIso8601String(),
      'attendant_config': {
        'version': '1.0',
        'requiredUserProperties': config.requiredProperties.toList(),
        'activeModules': [
          ...config.selectedShields.map((id) => {'id': id, 'type': 'shield'}),
          ...config.selectedFeatures.map((id) => {'id': id, 'type': 'feature'})
        ],
        'aggregatorRule': {
          'type': config.aggregationLogic == AggregationLogic.requireAll ? 'LOGICAL_AND' : 'LOGICAL_OR'
        }
      }
    };
    await _sessionsApi.createSession(sessionData);
  }
}