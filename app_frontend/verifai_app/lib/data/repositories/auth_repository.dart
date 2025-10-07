import 'package:shared_preferences/shared_preferences.dart';
import 'package:verifai_app/api/auth_api.dart';

// Provides a clean API for authentication, handling token storage.
class AuthRepository {
  final AuthApi _authApi;
  AuthRepository(this._authApi);

  Future<void> login(String email, String password) async {
    final response = await _authApi.login(email, password);
    final token = response['token'];

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('authToken', token);
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
  }) async {
    await _authApi.register(name: name, email: email, password: password);
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('authToken');
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('authToken');
  }
}