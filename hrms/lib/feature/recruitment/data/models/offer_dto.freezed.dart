// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'offer_dto.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$OfferDto {

 String get id; String? get jobApplicationId; String? get departmentId; String? get proposedSalary; DateTime? get proposedHireDate; String? get notes; String? get candidateNotes; String get status; DateTime get createdAt;
/// Create a copy of OfferDto
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$OfferDtoCopyWith<OfferDto> get copyWith => _$OfferDtoCopyWithImpl<OfferDto>(this as OfferDto, _$identity);

  /// Serializes this OfferDto to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is OfferDto&&(identical(other.id, id) || other.id == id)&&(identical(other.jobApplicationId, jobApplicationId) || other.jobApplicationId == jobApplicationId)&&(identical(other.departmentId, departmentId) || other.departmentId == departmentId)&&(identical(other.proposedSalary, proposedSalary) || other.proposedSalary == proposedSalary)&&(identical(other.proposedHireDate, proposedHireDate) || other.proposedHireDate == proposedHireDate)&&(identical(other.notes, notes) || other.notes == notes)&&(identical(other.candidateNotes, candidateNotes) || other.candidateNotes == candidateNotes)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,jobApplicationId,departmentId,proposedSalary,proposedHireDate,notes,candidateNotes,status,createdAt);

@override
String toString() {
  return 'OfferDto(id: $id, jobApplicationId: $jobApplicationId, departmentId: $departmentId, proposedSalary: $proposedSalary, proposedHireDate: $proposedHireDate, notes: $notes, candidateNotes: $candidateNotes, status: $status, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $OfferDtoCopyWith<$Res>  {
  factory $OfferDtoCopyWith(OfferDto value, $Res Function(OfferDto) _then) = _$OfferDtoCopyWithImpl;
@useResult
$Res call({
 String id, String? jobApplicationId, String? departmentId, String? proposedSalary, DateTime? proposedHireDate, String? notes, String? candidateNotes, String status, DateTime createdAt
});




}
/// @nodoc
class _$OfferDtoCopyWithImpl<$Res>
    implements $OfferDtoCopyWith<$Res> {
  _$OfferDtoCopyWithImpl(this._self, this._then);

  final OfferDto _self;
  final $Res Function(OfferDto) _then;

/// Create a copy of OfferDto
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? jobApplicationId = freezed,Object? departmentId = freezed,Object? proposedSalary = freezed,Object? proposedHireDate = freezed,Object? notes = freezed,Object? candidateNotes = freezed,Object? status = null,Object? createdAt = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,jobApplicationId: freezed == jobApplicationId ? _self.jobApplicationId : jobApplicationId // ignore: cast_nullable_to_non_nullable
as String?,departmentId: freezed == departmentId ? _self.departmentId : departmentId // ignore: cast_nullable_to_non_nullable
as String?,proposedSalary: freezed == proposedSalary ? _self.proposedSalary : proposedSalary // ignore: cast_nullable_to_non_nullable
as String?,proposedHireDate: freezed == proposedHireDate ? _self.proposedHireDate : proposedHireDate // ignore: cast_nullable_to_non_nullable
as DateTime?,notes: freezed == notes ? _self.notes : notes // ignore: cast_nullable_to_non_nullable
as String?,candidateNotes: freezed == candidateNotes ? _self.candidateNotes : candidateNotes // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}

}


/// Adds pattern-matching-related methods to [OfferDto].
extension OfferDtoPatterns on OfferDto {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _OfferDto value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _OfferDto() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _OfferDto value)  $default,){
final _that = this;
switch (_that) {
case _OfferDto():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _OfferDto value)?  $default,){
final _that = this;
switch (_that) {
case _OfferDto() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String? jobApplicationId,  String? departmentId,  String? proposedSalary,  DateTime? proposedHireDate,  String? notes,  String? candidateNotes,  String status,  DateTime createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _OfferDto() when $default != null:
return $default(_that.id,_that.jobApplicationId,_that.departmentId,_that.proposedSalary,_that.proposedHireDate,_that.notes,_that.candidateNotes,_that.status,_that.createdAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String? jobApplicationId,  String? departmentId,  String? proposedSalary,  DateTime? proposedHireDate,  String? notes,  String? candidateNotes,  String status,  DateTime createdAt)  $default,) {final _that = this;
switch (_that) {
case _OfferDto():
return $default(_that.id,_that.jobApplicationId,_that.departmentId,_that.proposedSalary,_that.proposedHireDate,_that.notes,_that.candidateNotes,_that.status,_that.createdAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String? jobApplicationId,  String? departmentId,  String? proposedSalary,  DateTime? proposedHireDate,  String? notes,  String? candidateNotes,  String status,  DateTime createdAt)?  $default,) {final _that = this;
switch (_that) {
case _OfferDto() when $default != null:
return $default(_that.id,_that.jobApplicationId,_that.departmentId,_that.proposedSalary,_that.proposedHireDate,_that.notes,_that.candidateNotes,_that.status,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _OfferDto implements OfferDto {
  const _OfferDto({required this.id, this.jobApplicationId, this.departmentId, this.proposedSalary, this.proposedHireDate, this.notes, this.candidateNotes, required this.status, required this.createdAt});
  factory _OfferDto.fromJson(Map<String, dynamic> json) => _$OfferDtoFromJson(json);

@override final  String id;
@override final  String? jobApplicationId;
@override final  String? departmentId;
@override final  String? proposedSalary;
@override final  DateTime? proposedHireDate;
@override final  String? notes;
@override final  String? candidateNotes;
@override final  String status;
@override final  DateTime createdAt;

/// Create a copy of OfferDto
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$OfferDtoCopyWith<_OfferDto> get copyWith => __$OfferDtoCopyWithImpl<_OfferDto>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$OfferDtoToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _OfferDto&&(identical(other.id, id) || other.id == id)&&(identical(other.jobApplicationId, jobApplicationId) || other.jobApplicationId == jobApplicationId)&&(identical(other.departmentId, departmentId) || other.departmentId == departmentId)&&(identical(other.proposedSalary, proposedSalary) || other.proposedSalary == proposedSalary)&&(identical(other.proposedHireDate, proposedHireDate) || other.proposedHireDate == proposedHireDate)&&(identical(other.notes, notes) || other.notes == notes)&&(identical(other.candidateNotes, candidateNotes) || other.candidateNotes == candidateNotes)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,jobApplicationId,departmentId,proposedSalary,proposedHireDate,notes,candidateNotes,status,createdAt);

@override
String toString() {
  return 'OfferDto(id: $id, jobApplicationId: $jobApplicationId, departmentId: $departmentId, proposedSalary: $proposedSalary, proposedHireDate: $proposedHireDate, notes: $notes, candidateNotes: $candidateNotes, status: $status, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$OfferDtoCopyWith<$Res> implements $OfferDtoCopyWith<$Res> {
  factory _$OfferDtoCopyWith(_OfferDto value, $Res Function(_OfferDto) _then) = __$OfferDtoCopyWithImpl;
@override @useResult
$Res call({
 String id, String? jobApplicationId, String? departmentId, String? proposedSalary, DateTime? proposedHireDate, String? notes, String? candidateNotes, String status, DateTime createdAt
});




}
/// @nodoc
class __$OfferDtoCopyWithImpl<$Res>
    implements _$OfferDtoCopyWith<$Res> {
  __$OfferDtoCopyWithImpl(this._self, this._then);

  final _OfferDto _self;
  final $Res Function(_OfferDto) _then;

/// Create a copy of OfferDto
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? jobApplicationId = freezed,Object? departmentId = freezed,Object? proposedSalary = freezed,Object? proposedHireDate = freezed,Object? notes = freezed,Object? candidateNotes = freezed,Object? status = null,Object? createdAt = null,}) {
  return _then(_OfferDto(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,jobApplicationId: freezed == jobApplicationId ? _self.jobApplicationId : jobApplicationId // ignore: cast_nullable_to_non_nullable
as String?,departmentId: freezed == departmentId ? _self.departmentId : departmentId // ignore: cast_nullable_to_non_nullable
as String?,proposedSalary: freezed == proposedSalary ? _self.proposedSalary : proposedSalary // ignore: cast_nullable_to_non_nullable
as String?,proposedHireDate: freezed == proposedHireDate ? _self.proposedHireDate : proposedHireDate // ignore: cast_nullable_to_non_nullable
as DateTime?,notes: freezed == notes ? _self.notes : notes // ignore: cast_nullable_to_non_nullable
as String?,candidateNotes: freezed == candidateNotes ? _self.candidateNotes : candidateNotes // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}


}

// dart format on
