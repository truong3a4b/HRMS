// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'login_data_dto.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$LoginDataDto {

@JsonKey(name: "accessToken") String get accessToken;@JsonKey(name: "user") UserDto get user;
/// Create a copy of LoginDataDto
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$LoginDataDtoCopyWith<LoginDataDto> get copyWith => _$LoginDataDtoCopyWithImpl<LoginDataDto>(this as LoginDataDto, _$identity);

  /// Serializes this LoginDataDto to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is LoginDataDto&&(identical(other.accessToken, accessToken) || other.accessToken == accessToken)&&(identical(other.user, user) || other.user == user));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,accessToken,user);

@override
String toString() {
  return 'LoginDataDto(accessToken: $accessToken, user: $user)';
}


}

/// @nodoc
abstract mixin class $LoginDataDtoCopyWith<$Res>  {
  factory $LoginDataDtoCopyWith(LoginDataDto value, $Res Function(LoginDataDto) _then) = _$LoginDataDtoCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: "accessToken") String accessToken,@JsonKey(name: "user") UserDto user
});


$UserDtoCopyWith<$Res> get user;

}
/// @nodoc
class _$LoginDataDtoCopyWithImpl<$Res>
    implements $LoginDataDtoCopyWith<$Res> {
  _$LoginDataDtoCopyWithImpl(this._self, this._then);

  final LoginDataDto _self;
  final $Res Function(LoginDataDto) _then;

/// Create a copy of LoginDataDto
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? accessToken = null,Object? user = null,}) {
  return _then(_self.copyWith(
accessToken: null == accessToken ? _self.accessToken : accessToken // ignore: cast_nullable_to_non_nullable
as String,user: null == user ? _self.user : user // ignore: cast_nullable_to_non_nullable
as UserDto,
  ));
}
/// Create a copy of LoginDataDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$UserDtoCopyWith<$Res> get user {
  
  return $UserDtoCopyWith<$Res>(_self.user, (value) {
    return _then(_self.copyWith(user: value));
  });
}
}


/// Adds pattern-matching-related methods to [LoginDataDto].
extension LoginDataDtoPatterns on LoginDataDto {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _LoginDataDto value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _LoginDataDto() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _LoginDataDto value)  $default,){
final _that = this;
switch (_that) {
case _LoginDataDto():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _LoginDataDto value)?  $default,){
final _that = this;
switch (_that) {
case _LoginDataDto() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: "accessToken")  String accessToken, @JsonKey(name: "user")  UserDto user)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _LoginDataDto() when $default != null:
return $default(_that.accessToken,_that.user);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: "accessToken")  String accessToken, @JsonKey(name: "user")  UserDto user)  $default,) {final _that = this;
switch (_that) {
case _LoginDataDto():
return $default(_that.accessToken,_that.user);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: "accessToken")  String accessToken, @JsonKey(name: "user")  UserDto user)?  $default,) {final _that = this;
switch (_that) {
case _LoginDataDto() when $default != null:
return $default(_that.accessToken,_that.user);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _LoginDataDto implements LoginDataDto {
  const _LoginDataDto({@JsonKey(name: "accessToken") required this.accessToken, @JsonKey(name: "user") required this.user});
  factory _LoginDataDto.fromJson(Map<String, dynamic> json) => _$LoginDataDtoFromJson(json);

@override@JsonKey(name: "accessToken") final  String accessToken;
@override@JsonKey(name: "user") final  UserDto user;

/// Create a copy of LoginDataDto
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$LoginDataDtoCopyWith<_LoginDataDto> get copyWith => __$LoginDataDtoCopyWithImpl<_LoginDataDto>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$LoginDataDtoToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _LoginDataDto&&(identical(other.accessToken, accessToken) || other.accessToken == accessToken)&&(identical(other.user, user) || other.user == user));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,accessToken,user);

@override
String toString() {
  return 'LoginDataDto(accessToken: $accessToken, user: $user)';
}


}

/// @nodoc
abstract mixin class _$LoginDataDtoCopyWith<$Res> implements $LoginDataDtoCopyWith<$Res> {
  factory _$LoginDataDtoCopyWith(_LoginDataDto value, $Res Function(_LoginDataDto) _then) = __$LoginDataDtoCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: "accessToken") String accessToken,@JsonKey(name: "user") UserDto user
});


@override $UserDtoCopyWith<$Res> get user;

}
/// @nodoc
class __$LoginDataDtoCopyWithImpl<$Res>
    implements _$LoginDataDtoCopyWith<$Res> {
  __$LoginDataDtoCopyWithImpl(this._self, this._then);

  final _LoginDataDto _self;
  final $Res Function(_LoginDataDto) _then;

/// Create a copy of LoginDataDto
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? accessToken = null,Object? user = null,}) {
  return _then(_LoginDataDto(
accessToken: null == accessToken ? _self.accessToken : accessToken // ignore: cast_nullable_to_non_nullable
as String,user: null == user ? _self.user : user // ignore: cast_nullable_to_non_nullable
as UserDto,
  ));
}

/// Create a copy of LoginDataDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$UserDtoCopyWith<$Res> get user {
  
  return $UserDtoCopyWith<$Res>(_self.user, (value) {
    return _then(_self.copyWith(user: value));
  });
}
}

// dart format on
