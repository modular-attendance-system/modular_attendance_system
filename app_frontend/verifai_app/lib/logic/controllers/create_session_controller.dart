import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:verifai_app/data/models/session_config.dart';
import 'package:verifai_app/data/repositories/session_repository.dart';

// Manages the state of the session creation wizard.
class CreateSessionController extends StateNotifier<SessionConfig> {
  final SessionRepository _sessionRepository;

  CreateSessionController(this._sessionRepository) : super(SessionConfig());

  void updateName(String name) => state = state.copyWith(name: name);
  void updateDescription(String desc) => state = state.copyWith(description: desc);
  void updateStartTime(DateTime time) => state = state.copyWith(startTime: time);
  void updateEndTime(DateTime time) => state = state.copyWith(endTime: time);

  void toggleProperty(String propertyId) {
    final newSet = Set<String>.from(state.requiredProperties);
    if (newSet.contains(propertyId)) {
      newSet.remove(propertyId);
    } else {
      newSet.add(propertyId);
    }
    state = state.copyWith(requiredProperties: newSet);
  }

  void toggleShield(String shieldId) {
    final newSet = Set<String>.from(state.selectedShields);
    if (newSet.contains(shieldId)) {
      newSet.remove(shieldId);
    } else {
      newSet.add(shieldId);
    }
    state = state.copyWith(selectedShields: newSet);
  }

  void toggleFeature(String featureId) {
     final newSet = Set<String>.from(state.selectedFeatures);
    if (newSet.contains(featureId)) {
      newSet.remove(featureId);
    } else {
      newSet.add(featureId);
    }
    state = state.copyWith(selectedFeatures: newSet);
  }

  void setAggregationLogic(AggregationLogic logic) {
    state = state.copyWith(aggregationLogic: logic);
  }

  Future<void> createSession() async {
    if (state.name.isEmpty) throw Exception('Session Name is required.');
    await _sessionRepository.createSession(state);
  }
}