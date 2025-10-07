import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// Handles direct communication with the backend's session-related endpoints.
class SessionsApi {
  final String _baseUrl = 'http://10.0.2.2:4000/api';

  // Helper to get headers with the user's auth token.
  Future<Map<String, String>> _getAuthHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // Future<void> submitQrCode(String sessionId, String qrData) async {
  //   final response = await http.post(
  //     // This is an assumed endpoint. Ensure it matches your backend router.
  //     Uri.parse('$_baseUrl/attendee/sessions/$sessionId/scan'),
  //     headers: await _getHeaders(),
  //     body: jsonEncode({'qrCodeData': qrData}),
  //   );

  //   if (response.statusCode != 200) {
  //     final data = jsonDecode(response.body);
  //     throw Exception(data['error'] ?? 'Failed to submit QR code.');
  //   }
  // }

  Future<List<dynamic>> getMySessions() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/sessions/my'),
      headers: await _getAuthHeaders(),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load sessions.');
    }
  }

  Future<Map<String, dynamic>> getSessionById(String sessionId) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/attendant/sessions/$sessionId'),
      headers: await _getAuthHeaders(),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load session details.');
    }
  }
   Future<Map<String, dynamic>> getAttendeeStatus(String sessionId) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/attendee/sessions/$sessionId/status'),
      headers: await _getAuthHeaders(),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load attendee status.');
    }
  }


  Future<void> createSession(Map<String, dynamic> sessionData) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/attendant/sessions'),
      headers: await _getAuthHeaders(),
      body: jsonEncode(sessionData),
    );

    if (response.statusCode != 201) {
      final data = jsonDecode(response.body);
      throw Exception(data['error'] ?? 'Failed to create session.');
    }
  }
}