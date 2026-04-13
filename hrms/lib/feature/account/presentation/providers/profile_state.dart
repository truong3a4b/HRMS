class ProfileState {
  final String name;
  final String email;
  final String phoneNumber;
  final String profilePictureUrl;

  ProfileState({
    required this.name,
    required this.email,
    required this.phoneNumber,
    required this.profilePictureUrl,
  });

  factory ProfileState.initial() {
    return ProfileState(
      name: '',
      email: '',
      phoneNumber: '',
      profilePictureUrl: '',
    );
  }

  ProfileState copyWith({
    String? name,
    String? email,
    String? phoneNumber,
    String? profilePictureUrl,
  }) {
    return ProfileState(
      name: name ?? this.name,
      email: email ?? this.email,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      profilePictureUrl: profilePictureUrl ?? this.profilePictureUrl,
    );
  }
}