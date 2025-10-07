// Represents the data structure for an attendee's status within a session.
class AttendeeStatus {
  final String state;
  // We can add more fields later as needed.
  AttendeeStatus({required this.state});

  factory AttendeeStatus.fromJson(Map<String, dynamic> json) {
    return AttendeeStatus(state: json['currentState'] ?? 'Unresolved');
  }
}