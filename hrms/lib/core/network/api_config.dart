class ApiConfig {
  static const baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://hrms-nci9.onrender.com/api',
  );

  static const socketUrl = String.fromEnvironment(
    'SOCKET_URL',
    defaultValue: 'https://hrms-nci9.onrender.com',
  );

  static const timeout = Duration(seconds: 30);
}
