// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'position_dto.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$PositionDto {

 String get id; String get name; String? get code; String? get description; List<String> get permissions; DateTime? get createdAt; DateTime? get updatedAt;
/// Create a copy of PositionDto
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PositionDtoCopyWith<PositionDto> get copyWith => _$PositionDtoCopyWithImpl<PositionDto>(this as PositionDto, _$identity);

  /// Serializes this PositionDto to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is PositionDto&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.code, code) || other.code == code)&&(identical(other.description, description) || other.description == description)&&const DeepCollectionEquality().equals(other.permissions, permissions)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,code,description,const DeepCollectionEquality().hash(permissions),createdAt,updatedAt);

@override
String toString() {
  return 'PositionDto(id: $id, name: $name, code: $code, description: $description, permissions: $permissions, createdAt: $createdAt, updatedAt: $updatedAt)';
}


}

/// @nodoc
abstract mixin class $PositionDtoCopyWith<$Res>  {
  factory $PositionDtoCopyWith(PositionDto value, $Res Function(PositionDto) _then) = _$PositionDtoCopyWithImpl;
@useResult
$Res call({
 String id, String name, String? code, String? description, List<String> permissions, DateTime? createdAt, DateTime? updatedAt
});




}
/// @nodoc
class _$PositionDtoCopyWithImpl<$Res>
    implements $PositionDtoCopyWith<$Res> {
  _$PositionDtoCopyWithImpl(this._self, this._then);

  final PositionDto _self;
  final $Res Function(PositionDto) _then;

/// Create a copy of PositionDto
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? code = freezed,Object? description = freezed,Object? permissions = null,Object? createdAt = freezed,Object? updatedAt = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,code: freezed == code ? _self.code : code // ignore: cast_nullable_to_non_nullable
as String?,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,permissions: null == permissions ? _self.permissions : permissions // ignore: cast_nullable_to_non_nullable
as List<String>,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}

}


/// Adds pattern-matching-related methods to [PositionDto].
extension PositionDtoPatterns on PositionDto {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _PositionDto value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _PositionDto() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _PositionDto value)  $default,){
final _that = this;
switch (_that) {
case _PositionDto():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _PositionDto value)?  $default,){
final _that = this;
switch (_that) {
case _PositionDto() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  String? code,  String? description,  List<String> permissions,  DateTime? createdAt,  DateTime? updatedAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _PositionDto() when $default != null:
return $default(_that.id,_that.name,_that.code,_that.description,_that.permissions,_that.createdAt,_that.updatedAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  String? code,  String? description,  List<String> permissions,  DateTime? createdAt,  DateTime? updatedAt)  $default,) {final _that = this;
switch (_that) {
case _PositionDto():
return $default(_that.id,_that.name,_that.code,_that.description,_that.permissions,_that.createdAt,_that.updatedAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  String? code,  String? description,  List<String> permissions,  DateTime? createdAt,  DateTime? updatedAt)?  $default,) {final _that = this;
switch (_that) {
case _PositionDto() when $default != null:
return $default(_that.id,_that.name,_that.code,_that.description,_that.permissions,_that.createdAt,_that.updatedAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _PositionDto implements PositionDto {
  const _PositionDto({required this.id, required this.name, this.code, this.description, final  List<String> permissions = const [], this.createdAt, this.updatedAt}): _permissions = permissions;
  factory _PositionDto.fromJson(Map<String, dynamic> json) => _$PositionDtoFromJson(json);

@override final  String id;
@override final  String name;
@override final  String? code;
@override final  String? description;
 final  List<String> _permissions;
@override@JsonKey() List<String> get permissions {
  if (_permissions is EqualUnmodifiableListView) return _permissions;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_permissions);
}

@override final  DateTime? createdAt;
@override final  DateTime? updatedAt;

/// Create a copy of PositionDto
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PositionDtoCopyWith<_PositionDto> get copyWith => __$PositionDtoCopyWithImpl<_PositionDto>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$PositionDtoToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _PositionDto&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.code, code) || other.code == code)&&(identical(other.description, description) || other.description == description)&&const DeepCollectionEquality().equals(other._permissions, _permissions)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,code,description,const DeepCollectionEquality().hash(_permissions),createdAt,updatedAt);

@override
String toString() {
  return 'PositionDto(id: $id, name: $name, code: $code, description: $description, permissions: $permissions, createdAt: $createdAt, updatedAt: $updatedAt)';
}


}

/// @nodoc
abstract mixin class _$PositionDtoCopyWith<$Res> implements $PositionDtoCopyWith<$Res> {
  factory _$PositionDtoCopyWith(_PositionDto value, $Res Function(_PositionDto) _then) = __$PositionDtoCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, String? code, String? description, List<String> permissions, DateTime? createdAt, DateTime? updatedAt
});




}
/// @nodoc
class __$PositionDtoCopyWithImpl<$Res>
    implements _$PositionDtoCopyWith<$Res> {
  __$PositionDtoCopyWithImpl(this._self, this._then);

  final _PositionDto _self;
  final $Res Function(_PositionDto) _then;

/// Create a copy of PositionDto
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? code = freezed,Object? description = freezed,Object? permissions = null,Object? createdAt = freezed,Object? updatedAt = freezed,}) {
  return _then(_PositionDto(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,code: freezed == code ? _self.code : code // ignore: cast_nullable_to_non_nullable
as String?,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,permissions: null == permissions ? _self._permissions : permissions // ignore: cast_nullable_to_non_nullable
as List<String>,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}


}

// dart format on
