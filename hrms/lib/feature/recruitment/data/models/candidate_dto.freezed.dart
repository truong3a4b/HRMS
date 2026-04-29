// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'candidate_dto.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$CandidateDto {

 String get id; String get userId; String? get fullName; String get email; String? get phone; DateTime? get dateOfBirth; String? get address; String? get avatar; String? get cvUrl; DateTime? get createdAt; DateTime? get updatedAt; UserDto? get user;
/// Create a copy of CandidateDto
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CandidateDtoCopyWith<CandidateDto> get copyWith => _$CandidateDtoCopyWithImpl<CandidateDto>(this as CandidateDto, _$identity);

  /// Serializes this CandidateDto to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CandidateDto&&(identical(other.id, id) || other.id == id)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.fullName, fullName) || other.fullName == fullName)&&(identical(other.email, email) || other.email == email)&&(identical(other.phone, phone) || other.phone == phone)&&(identical(other.dateOfBirth, dateOfBirth) || other.dateOfBirth == dateOfBirth)&&(identical(other.address, address) || other.address == address)&&(identical(other.avatar, avatar) || other.avatar == avatar)&&(identical(other.cvUrl, cvUrl) || other.cvUrl == cvUrl)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.user, user) || other.user == user));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,userId,fullName,email,phone,dateOfBirth,address,avatar,cvUrl,createdAt,updatedAt,user);

@override
String toString() {
  return 'CandidateDto(id: $id, userId: $userId, fullName: $fullName, email: $email, phone: $phone, dateOfBirth: $dateOfBirth, address: $address, avatar: $avatar, cvUrl: $cvUrl, createdAt: $createdAt, updatedAt: $updatedAt, user: $user)';
}


}

/// @nodoc
abstract mixin class $CandidateDtoCopyWith<$Res>  {
  factory $CandidateDtoCopyWith(CandidateDto value, $Res Function(CandidateDto) _then) = _$CandidateDtoCopyWithImpl;
@useResult
$Res call({
 String id, String userId, String? fullName, String email, String? phone, DateTime? dateOfBirth, String? address, String? avatar, String? cvUrl, DateTime? createdAt, DateTime? updatedAt, UserDto? user
});


$UserDtoCopyWith<$Res>? get user;

}
/// @nodoc
class _$CandidateDtoCopyWithImpl<$Res>
    implements $CandidateDtoCopyWith<$Res> {
  _$CandidateDtoCopyWithImpl(this._self, this._then);

  final CandidateDto _self;
  final $Res Function(CandidateDto) _then;

/// Create a copy of CandidateDto
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? userId = null,Object? fullName = freezed,Object? email = null,Object? phone = freezed,Object? dateOfBirth = freezed,Object? address = freezed,Object? avatar = freezed,Object? cvUrl = freezed,Object? createdAt = freezed,Object? updatedAt = freezed,Object? user = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,userId: null == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String,fullName: freezed == fullName ? _self.fullName : fullName // ignore: cast_nullable_to_non_nullable
as String?,email: null == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String,phone: freezed == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String?,dateOfBirth: freezed == dateOfBirth ? _self.dateOfBirth : dateOfBirth // ignore: cast_nullable_to_non_nullable
as DateTime?,address: freezed == address ? _self.address : address // ignore: cast_nullable_to_non_nullable
as String?,avatar: freezed == avatar ? _self.avatar : avatar // ignore: cast_nullable_to_non_nullable
as String?,cvUrl: freezed == cvUrl ? _self.cvUrl : cvUrl // ignore: cast_nullable_to_non_nullable
as String?,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,user: freezed == user ? _self.user : user // ignore: cast_nullable_to_non_nullable
as UserDto?,
  ));
}
/// Create a copy of CandidateDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$UserDtoCopyWith<$Res>? get user {
    if (_self.user == null) {
    return null;
  }

  return $UserDtoCopyWith<$Res>(_self.user!, (value) {
    return _then(_self.copyWith(user: value));
  });
}
}


/// Adds pattern-matching-related methods to [CandidateDto].
extension CandidateDtoPatterns on CandidateDto {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _CandidateDto value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _CandidateDto() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _CandidateDto value)  $default,){
final _that = this;
switch (_that) {
case _CandidateDto():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _CandidateDto value)?  $default,){
final _that = this;
switch (_that) {
case _CandidateDto() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String userId,  String? fullName,  String email,  String? phone,  DateTime? dateOfBirth,  String? address,  String? avatar,  String? cvUrl,  DateTime? createdAt,  DateTime? updatedAt,  UserDto? user)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _CandidateDto() when $default != null:
return $default(_that.id,_that.userId,_that.fullName,_that.email,_that.phone,_that.dateOfBirth,_that.address,_that.avatar,_that.cvUrl,_that.createdAt,_that.updatedAt,_that.user);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String userId,  String? fullName,  String email,  String? phone,  DateTime? dateOfBirth,  String? address,  String? avatar,  String? cvUrl,  DateTime? createdAt,  DateTime? updatedAt,  UserDto? user)  $default,) {final _that = this;
switch (_that) {
case _CandidateDto():
return $default(_that.id,_that.userId,_that.fullName,_that.email,_that.phone,_that.dateOfBirth,_that.address,_that.avatar,_that.cvUrl,_that.createdAt,_that.updatedAt,_that.user);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String userId,  String? fullName,  String email,  String? phone,  DateTime? dateOfBirth,  String? address,  String? avatar,  String? cvUrl,  DateTime? createdAt,  DateTime? updatedAt,  UserDto? user)?  $default,) {final _that = this;
switch (_that) {
case _CandidateDto() when $default != null:
return $default(_that.id,_that.userId,_that.fullName,_that.email,_that.phone,_that.dateOfBirth,_that.address,_that.avatar,_that.cvUrl,_that.createdAt,_that.updatedAt,_that.user);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _CandidateDto implements CandidateDto {
  const _CandidateDto({required this.id, required this.userId, this.fullName, required this.email, this.phone, this.dateOfBirth, this.address, this.avatar, this.cvUrl, this.createdAt, this.updatedAt, this.user});
  factory _CandidateDto.fromJson(Map<String, dynamic> json) => _$CandidateDtoFromJson(json);

@override final  String id;
@override final  String userId;
@override final  String? fullName;
@override final  String email;
@override final  String? phone;
@override final  DateTime? dateOfBirth;
@override final  String? address;
@override final  String? avatar;
@override final  String? cvUrl;
@override final  DateTime? createdAt;
@override final  DateTime? updatedAt;
@override final  UserDto? user;

/// Create a copy of CandidateDto
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CandidateDtoCopyWith<_CandidateDto> get copyWith => __$CandidateDtoCopyWithImpl<_CandidateDto>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CandidateDtoToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _CandidateDto&&(identical(other.id, id) || other.id == id)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.fullName, fullName) || other.fullName == fullName)&&(identical(other.email, email) || other.email == email)&&(identical(other.phone, phone) || other.phone == phone)&&(identical(other.dateOfBirth, dateOfBirth) || other.dateOfBirth == dateOfBirth)&&(identical(other.address, address) || other.address == address)&&(identical(other.avatar, avatar) || other.avatar == avatar)&&(identical(other.cvUrl, cvUrl) || other.cvUrl == cvUrl)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.user, user) || other.user == user));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,userId,fullName,email,phone,dateOfBirth,address,avatar,cvUrl,createdAt,updatedAt,user);

@override
String toString() {
  return 'CandidateDto(id: $id, userId: $userId, fullName: $fullName, email: $email, phone: $phone, dateOfBirth: $dateOfBirth, address: $address, avatar: $avatar, cvUrl: $cvUrl, createdAt: $createdAt, updatedAt: $updatedAt, user: $user)';
}


}

/// @nodoc
abstract mixin class _$CandidateDtoCopyWith<$Res> implements $CandidateDtoCopyWith<$Res> {
  factory _$CandidateDtoCopyWith(_CandidateDto value, $Res Function(_CandidateDto) _then) = __$CandidateDtoCopyWithImpl;
@override @useResult
$Res call({
 String id, String userId, String? fullName, String email, String? phone, DateTime? dateOfBirth, String? address, String? avatar, String? cvUrl, DateTime? createdAt, DateTime? updatedAt, UserDto? user
});


@override $UserDtoCopyWith<$Res>? get user;

}
/// @nodoc
class __$CandidateDtoCopyWithImpl<$Res>
    implements _$CandidateDtoCopyWith<$Res> {
  __$CandidateDtoCopyWithImpl(this._self, this._then);

  final _CandidateDto _self;
  final $Res Function(_CandidateDto) _then;

/// Create a copy of CandidateDto
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? userId = null,Object? fullName = freezed,Object? email = null,Object? phone = freezed,Object? dateOfBirth = freezed,Object? address = freezed,Object? avatar = freezed,Object? cvUrl = freezed,Object? createdAt = freezed,Object? updatedAt = freezed,Object? user = freezed,}) {
  return _then(_CandidateDto(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,userId: null == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String,fullName: freezed == fullName ? _self.fullName : fullName // ignore: cast_nullable_to_non_nullable
as String?,email: null == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String,phone: freezed == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String?,dateOfBirth: freezed == dateOfBirth ? _self.dateOfBirth : dateOfBirth // ignore: cast_nullable_to_non_nullable
as DateTime?,address: freezed == address ? _self.address : address // ignore: cast_nullable_to_non_nullable
as String?,avatar: freezed == avatar ? _self.avatar : avatar // ignore: cast_nullable_to_non_nullable
as String?,cvUrl: freezed == cvUrl ? _self.cvUrl : cvUrl // ignore: cast_nullable_to_non_nullable
as String?,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,user: freezed == user ? _self.user : user // ignore: cast_nullable_to_non_nullable
as UserDto?,
  ));
}

/// Create a copy of CandidateDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$UserDtoCopyWith<$Res>? get user {
    if (_self.user == null) {
    return null;
  }

  return $UserDtoCopyWith<$Res>(_self.user!, (value) {
    return _then(_self.copyWith(user: value));
  });
}
}

// dart format on
