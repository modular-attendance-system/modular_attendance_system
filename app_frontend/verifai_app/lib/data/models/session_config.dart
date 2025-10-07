// An enum to represent the different aggregation logic options.
enum AggregationLogic { requireAll, requireAny }

/// This class holds all the data collected during the session creation wizard.
class SessionConfig {
  final String name;
  final String description;
  final DateTime? startTime;
  final DateTime? endTime;
  final Set<String> requiredProperties;
  final Set<String> selectedShields;
  final Set<String> selectedFeatures;
  final AggregationLogic aggregationLogic;

  SessionConfig({
    this.name = '',
    this.description = '',
    this.startTime,
    this.endTime,
    this.requiredProperties = const {},
    this.selectedShields = const {},
    this.selectedFeatures = const {},
    this.aggregationLogic = AggregationLogic.requireAll,
  });

  // copyWith allows for easily creating a new state object with updated fields.
  SessionConfig copyWith({
    String? name,
    String? description,
    DateTime? startTime,
    DateTime? endTime,
    Set<String>? requiredProperties,
    Set<String>? selectedShields,
    Set<String>? selectedFeatures,
    AggregationLogic? aggregationLogic,
  }) {
    return SessionConfig(
      name: name ?? this.name,
      description: description ?? this.description,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      requiredProperties: requiredProperties ?? this.requiredProperties,
      selectedShields: selectedShields ?? this.selectedShields,
      selectedFeatures: selectedFeatures ?? this.selectedFeatures,
      aggregationLogic: aggregationLogic ?? this.aggregationLogic,
    );
  }
}