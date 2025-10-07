import 'dart:convert';
import 'package:http/http.dart' as http;

// Handles direct communication with the backend's authentication endpoints.
class AuthApi {
  // IMPORTANT: Use 10.0.2.2 for Android Emulator to connect to localhost.
  // For a physical device, use your computer's local network IP.
  final String _baseUrl = 'http://10.0.2.2:4000';

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/v1/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return data;
    } else {
      throw Exception(data['error'] ?? 'Failed to log in.');
    }
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/v1/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'displayName': name,
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode != 201) {
      final data = jsonDecode(response.body);
      throw Exception(data['error'] ?? 'Failed to register.');
    }
  }
}