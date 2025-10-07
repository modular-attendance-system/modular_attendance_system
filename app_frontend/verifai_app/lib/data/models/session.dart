// Represents the data structure for a session, fetched from the backend.
class Session {
  final String sessionId;
  final String name;
  final List<String> roles;
  final String status;

  Session({
    required this.sessionId,
    required this.name,
    required this.roles,
    required this.status,
  });

  // Factory constructor to create a Session from JSON.
  factory Session.fromJson(Map<String, dynamic> json) {
    return Session(
      sessionId: json['_id'] ?? json['sessionId'] ?? '',
      name: json['name'] ?? 'Untitled Session',
      roles: json['roles'] != null ? List<String>.from(json['roles']) : [],
      status: json['status'] ?? 'unknown',
    );
  }

  // Helper getters for easier access in the UI.
  String get primaryRole => roles.contains('attendant') ? 'Attendant' : 'Attendee';
  bool get isActive => status == 'active';
}