class ExtractError {
  static String extractFirstError(Map<String, dynamic>? data) {
    if (data == null) return 'Lỗi không xác định';

    final errors = data['errors'];
    if (errors == null) return data['message'] ?? 'Lỗi không xác định';

    final fieldErrors = errors['fieldErrors'];
    if (fieldErrors is Map) {
      for (final entry in fieldErrors.entries) {
        final value = entry.value;
        if (value is List && value.isNotEmpty) {
          return value.first.toString();
        }
      }
    }

    final formErrors = errors['formErrors'];
    if (formErrors is List && formErrors.isNotEmpty) {
      return formErrors.first.toString();
    }

    return data['message'] ?? 'Lỗi không xác định';
  }
}