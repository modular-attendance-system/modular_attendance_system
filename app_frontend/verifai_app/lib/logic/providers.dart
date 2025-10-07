import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:verifai_app/api/auth_api.dart';
import 'package:verifai_app/api/sessions_api.dart';
import 'package:verifai_app/data/models/attendee_status.dart';
import 'package:verifai_app/data/models/session.dart';
import 'package:verifai_app/data/models/session_config.dart';
import 'package:verifai_app/data/repositories/auth_repository.dart';
import 'package:verifai_app/data/repositories/session_repository.dart';
import 'package:verifai_app/logic/controllers/auth_controller.dart';
import 'package:verifai_app/logic/controllers/create_session_controller.dart';

// --- API PROVIDERS ---
final authApiProvider = Provider((ref) => AuthApi());
final sessionsApiProvider = Provider((ref) => SessionsApi());

// --- REPOSITORY PROVIDERS ---
final authRepositoryProvider = Provider(
  (ref) => AuthRepository(ref.watch(authApiProvider)),
);
final sessionRepositoryProvider = Provider(
  (ref) => SessionRepository(ref.watch(sessionsApiProvider)),
);

// --- CONTROLLER & STATE NOTIFIER PROVIDERS ---
final authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>(
  (ref) => AuthController(ref.watch(authRepositoryProvider)),
);

// THE FIX IS HERE: We remove `.autoDispose` to keep the wizard's state alive
// across all the steps of the PageView.
final createSessionControllerProvider =
    StateNotifierProvider<CreateSessionController, SessionConfig>(
  (ref) => CreateSessionController(ref.watch(sessionRepositoryProvider)),
);

// --- DATA PROVIDERS (FutureProvider) ---

final mySessionsProvider = FutureProvider.autoDispose<List<Session>>((ref) {
  // By watching the auth controller, this provider will automatically
  // re-fetch when the user logs in or out.
  ref.watch(authControllerProvider);
  return ref.watch(sessionRepositoryProvider).getMySessions();
});

final sessionDetailProvider =
    FutureProvider.autoDispose.family<Session, String>((ref, sessionId) {
  return ref.watch(sessionRepositoryProvider).getSessionById(sessionId);
});

final attendeeStatusProvider =
    FutureProvider.autoDispose.family<AttendeeStatus, String>((ref, sessionId) {
  return ref.watch(sessionRepositoryProvider).getAttendeeStatus(sessionId);
});

// Mock data providers for the create session wizard.
final availablePropertiesProvider = Provider<Map<String, String>>((ref) => {
      'prop_email': 'Email Address',
      'prop_student_id': 'Student ID',
      'prop_face_encodings': 'Face Encodings',
      'prop_license_plate': 'License Plate',
    });

final availableShieldsProvider = Provider<Map<String, String>>((ref) => {
      'maas.shield.geolocation': 'Geolocation Shield',
      'maas.shield.face_recognition': 'Face Recognition Shield',
      'maas.shield.qrcode': 'QR Code Scan Shield',
    });

final availableFeaturesProvider = Provider<Map<String, String>>((ref) => {
      'maas.feature.notification': 'Email Notification Feature',
      'maas.feature.reporting': 'Reporting Feature',
    });