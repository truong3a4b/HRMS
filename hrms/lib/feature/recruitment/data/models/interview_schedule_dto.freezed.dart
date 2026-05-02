// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'interview_schedule_dto.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$InterviewScheduleDto {

 String get id; String? get jobApplicationId; DateTime? get scheduledAt; String? get title; String? get type; String? get location; String? get interviewerNotes; DateTime? get candidateResponseAt; String? get candidateResponseNote; String get status; String? get createdByEmployeeId; DateTime? get createdAt; DateTime? get updatedAt;// nếu sau này backend include employee tạo lịch
 EmployeeDto? get createdBy;
/// Create a copy of InterviewScheduleDto
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$InterviewScheduleDtoCopyWith<InterviewScheduleDto> get copyWith => _$InterviewScheduleDtoCopyWithImpl<InterviewScheduleDto>(this as InterviewScheduleDto, _$identity);

  /// Serializes this InterviewScheduleDto to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is InterviewScheduleDto&&(identical(other.id, id) || other.id == id)&&(identical(other.jobApplicationId, jobApplicationId) || other.jobApplicationId == jobApplicationId)&&(identical(other.scheduledAt, scheduledAt) || other.scheduledAt == scheduledAt)&&(identical(other.title, title) || other.title == title)&&(identical(other.type, type) || other.type == type)&&(identical(other.location, location) || other.location == location)&&(identical(other.interviewerNotes, interviewerNotes) || other.interviewerNotes == interviewerNotes)&&(identical(other.candidateResponseAt, candidateResponseAt) || other.candidateResponseAt == candidateResponseAt)&&(identical(other.candidateResponseNote, candidateResponseNote) || other.candidateResponseNote == candidateResponseNote)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdByEmployeeId, createdByEmployeeId) || other.createdByEmployeeId == createdByEmployeeId)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.createdBy, createdBy) || other.createdBy == createdBy));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,jobApplicationId,scheduledAt,title,type,location,interviewerNotes,candidateResponseAt,candidateResponseNote,status,createdByEmployeeId,createdAt,updatedAt,createdBy);

@override
String toString() {
  return 'InterviewScheduleDto(id: $id, jobApplicationId: $jobApplicationId, scheduledAt: $scheduledAt, title: $title, type: $type, location: $location, interviewerNotes: $interviewerNotes, candidateResponseAt: $candidateResponseAt, candidateResponseNote: $candidateResponseNote, status: $status, createdByEmployeeId: $createdByEmployeeId, createdAt: $createdAt, updatedAt: $updatedAt, createdBy: $createdBy)';
}


}

/// @nodoc
abstract mixin class $InterviewScheduleDtoCopyWith<$Res>  {
  factory $InterviewScheduleDtoCopyWith(InterviewScheduleDto value, $Res Function(InterviewScheduleDto) _then) = _$InterviewScheduleDtoCopyWithImpl;
@useResult
$Res call({
 String id, String? jobApplicationId, DateTime? scheduledAt, String? title, String? type, String? location, String? interviewerNotes, DateTime? candidateResponseAt, String? candidateResponseNote, String status, String? createdByEmployeeId, DateTime? createdAt, DateTime? updatedAt, EmployeeDto? createdBy
});


$EmployeeDtoCopyWith<$Res>? get createdBy;

}
/// @nodoc
class _$InterviewScheduleDtoCopyWithImpl<$Res>
    implements $InterviewScheduleDtoCopyWith<$Res> {
  _$InterviewScheduleDtoCopyWithImpl(this._self, this._then);

  final InterviewScheduleDto _self;
  final $Res Function(InterviewScheduleDto) _then;

/// Create a copy of InterviewScheduleDto
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? jobApplicationId = freezed,Object? scheduledAt = freezed,Object? title = freezed,Object? type = freezed,Object? location = freezed,Object? interviewerNotes = freezed,Object? candidateResponseAt = freezed,Object? candidateResponseNote = freezed,Object? status = null,Object? createdByEmployeeId = freezed,Object? createdAt = freezed,Object? updatedAt = freezed,Object? createdBy = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,jobApplicationId: freezed == jobApplicationId ? _self.jobApplicationId : jobApplicationId // ignore: cast_nullable_to_non_nullable
as String?,scheduledAt: freezed == scheduledAt ? _self.scheduledAt : scheduledAt // ignore: cast_nullable_to_non_nullable
as DateTime?,title: freezed == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String?,type: freezed == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String?,location: freezed == location ? _self.location : location // ignore: cast_nullable_to_non_nullable
as String?,interviewerNotes: freezed == interviewerNotes ? _self.interviewerNotes : interviewerNotes // ignore: cast_nullable_to_non_nullable
as String?,candidateResponseAt: freezed == candidateResponseAt ? _self.candidateResponseAt : candidateResponseAt // ignore: cast_nullable_to_non_nullable
as DateTime?,candidateResponseNote: freezed == candidateResponseNote ? _self.candidateResponseNote : candidateResponseNote // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,createdByEmployeeId: freezed == createdByEmployeeId ? _self.createdByEmployeeId : createdByEmployeeId // ignore: cast_nullable_to_non_nullable
as String?,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,createdBy: freezed == createdBy ? _self.createdBy : createdBy // ignore: cast_nullable_to_non_nullable
as EmployeeDto?,
  ));
}
/// Create a copy of InterviewScheduleDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$EmployeeDtoCopyWith<$Res>? get createdBy {
    if (_self.createdBy == null) {
    return null;
  }

  return $EmployeeDtoCopyWith<$Res>(_self.createdBy!, (value) {
    return _then(_self.copyWith(createdBy: value));
  });
}
}


/// Adds pattern-matching-related methods to [InterviewScheduleDto].
extension InterviewScheduleDtoPatterns on InterviewScheduleDto {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _InterviewScheduleDto value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _InterviewScheduleDto() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _InterviewScheduleDto value)  $default,){
final _that = this;
switch (_that) {
case _InterviewScheduleDto():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _InterviewScheduleDto value)?  $default,){
final _that = this;
switch (_that) {
case _InterviewScheduleDto() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String? jobApplicationId,  DateTime? scheduledAt,  String? title,  String? type,  String? location,  String? interviewerNotes,  DateTime? candidateResponseAt,  String? candidateResponseNote,  String status,  String? createdByEmployeeId,  DateTime? createdAt,  DateTime? updatedAt,  EmployeeDto? createdBy)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _InterviewScheduleDto() when $default != null:
return $default(_that.id,_that.jobApplicationId,_that.scheduledAt,_that.title,_that.type,_that.location,_that.interviewerNotes,_that.candidateResponseAt,_that.candidateResponseNote,_that.status,_that.createdByEmployeeId,_that.createdAt,_that.updatedAt,_that.createdBy);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String? jobApplicationId,  DateTime? scheduledAt,  String? title,  String? type,  String? location,  String? interviewerNotes,  DateTime? candidateResponseAt,  String? candidateResponseNote,  String status,  String? createdByEmployeeId,  DateTime? createdAt,  DateTime? updatedAt,  EmployeeDto? createdBy)  $default,) {final _that = this;
switch (_that) {
case _InterviewScheduleDto():
return $default(_that.id,_that.jobApplicationId,_that.scheduledAt,_that.title,_that.type,_that.location,_that.interviewerNotes,_that.candidateResponseAt,_that.candidateResponseNote,_that.status,_that.createdByEmployeeId,_that.createdAt,_that.updatedAt,_that.createdBy);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String? jobApplicationId,  DateTime? scheduledAt,  String? title,  String? type,  String? location,  String? interviewerNotes,  DateTime? candidateResponseAt,  String? candidateResponseNote,  String status,  String? createdByEmployeeId,  DateTime? createdAt,  DateTime? updatedAt,  EmployeeDto? createdBy)?  $default,) {final _that = this;
switch (_that) {
case _InterviewScheduleDto() when $default != null:
return $default(_that.id,_that.jobApplicationId,_that.scheduledAt,_that.title,_that.type,_that.location,_that.interviewerNotes,_that.candidateResponseAt,_that.candidateResponseNote,_that.status,_that.createdByEmployeeId,_that.createdAt,_that.updatedAt,_that.createdBy);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _InterviewScheduleDto implements InterviewScheduleDto {
  const _InterviewScheduleDto({required this.id, this.jobApplicationId, this.scheduledAt, this.title, this.type, this.location, this.interviewerNotes, this.candidateResponseAt, this.candidateResponseNote, required this.status, this.createdByEmployeeId, this.createdAt, this.updatedAt, this.createdBy});
  factory _InterviewScheduleDto.fromJson(Map<String, dynamic> json) => _$InterviewScheduleDtoFromJson(json);

@override final  String id;
@override final  String? jobApplicationId;
@override final  DateTime? scheduledAt;
@override final  String? title;
@override final  String? type;
@override final  String? location;
@override final  String? interviewerNotes;
@override final  DateTime? candidateResponseAt;
@override final  String? candidateResponseNote;
@override final  String status;
@override final  String? createdByEmployeeId;
@override final  DateTime? createdAt;
@override final  DateTime? updatedAt;
// nếu sau này backend include employee tạo lịch
@override final  EmployeeDto? createdBy;

/// Create a copy of InterviewScheduleDto
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$InterviewScheduleDtoCopyWith<_InterviewScheduleDto> get copyWith => __$InterviewScheduleDtoCopyWithImpl<_InterviewScheduleDto>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$InterviewScheduleDtoToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _InterviewScheduleDto&&(identical(other.id, id) || other.id == id)&&(identical(other.jobApplicationId, jobApplicationId) || other.jobApplicationId == jobApplicationId)&&(identical(other.scheduledAt, scheduledAt) || other.scheduledAt == scheduledAt)&&(identical(other.title, title) || other.title == title)&&(identical(other.type, type) || other.type == type)&&(identical(other.location, location) || other.location == location)&&(identical(other.interviewerNotes, interviewerNotes) || other.interviewerNotes == interviewerNotes)&&(identical(other.candidateResponseAt, candidateResponseAt) || other.candidateResponseAt == candidateResponseAt)&&(identical(other.candidateResponseNote, candidateResponseNote) || other.candidateResponseNote == candidateResponseNote)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdByEmployeeId, createdByEmployeeId) || other.createdByEmployeeId == createdByEmployeeId)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.createdBy, createdBy) || other.createdBy == createdBy));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,jobApplicationId,scheduledAt,title,type,location,interviewerNotes,candidateResponseAt,candidateResponseNote,status,createdByEmployeeId,createdAt,updatedAt,createdBy);

@override
String toString() {
  return 'InterviewScheduleDto(id: $id, jobApplicationId: $jobApplicationId, scheduledAt: $scheduledAt, title: $title, type: $type, location: $location, interviewerNotes: $interviewerNotes, candidateResponseAt: $candidateResponseAt, candidateResponseNote: $candidateResponseNote, status: $status, createdByEmployeeId: $createdByEmployeeId, createdAt: $createdAt, updatedAt: $updatedAt, createdBy: $createdBy)';
}


}

/// @nodoc
abstract mixin class _$InterviewScheduleDtoCopyWith<$Res> implements $InterviewScheduleDtoCopyWith<$Res> {
  factory _$InterviewScheduleDtoCopyWith(_InterviewScheduleDto value, $Res Function(_InterviewScheduleDto) _then) = __$InterviewScheduleDtoCopyWithImpl;
@override @useResult
$Res call({
 String id, String? jobApplicationId, DateTime? scheduledAt, String? title, String? type, String? location, String? interviewerNotes, DateTime? candidateResponseAt, String? candidateResponseNote, String status, String? createdByEmployeeId, DateTime? createdAt, DateTime? updatedAt, EmployeeDto? createdBy
});


@override $EmployeeDtoCopyWith<$Res>? get createdBy;

}
/// @nodoc
class __$InterviewScheduleDtoCopyWithImpl<$Res>
    implements _$InterviewScheduleDtoCopyWith<$Res> {
  __$InterviewScheduleDtoCopyWithImpl(this._self, this._then);

  final _InterviewScheduleDto _self;
  final $Res Function(_InterviewScheduleDto) _then;

/// Create a copy of InterviewScheduleDto
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? jobApplicationId = freezed,Object? scheduledAt = freezed,Object? title = freezed,Object? type = freezed,Object? location = freezed,Object? interviewerNotes = freezed,Object? candidateResponseAt = freezed,Object? candidateResponseNote = freezed,Object? status = null,Object? createdByEmployeeId = freezed,Object? createdAt = freezed,Object? updatedAt = freezed,Object? createdBy = freezed,}) {
  return _then(_InterviewScheduleDto(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,jobApplicationId: freezed == jobApplicationId ? _self.jobApplicationId : jobApplicationId // ignore: cast_nullable_to_non_nullable
as String?,scheduledAt: freezed == scheduledAt ? _self.scheduledAt : scheduledAt // ignore: cast_nullable_to_non_nullable
as DateTime?,title: freezed == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String?,type: freezed == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String?,location: freezed == location ? _self.location : location // ignore: cast_nullable_to_non_nullable
as String?,interviewerNotes: freezed == interviewerNotes ? _self.interviewerNotes : interviewerNotes // ignore: cast_nullable_to_non_nullable
as String?,candidateResponseAt: freezed == candidateResponseAt ? _self.candidateResponseAt : candidateResponseAt // ignore: cast_nullable_to_non_nullable
as DateTime?,candidateResponseNote: freezed == candidateResponseNote ? _self.candidateResponseNote : candidateResponseNote // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,createdByEmployeeId: freezed == createdByEmployeeId ? _self.createdByEmployeeId : createdByEmployeeId // ignore: cast_nullable_to_non_nullable
as String?,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,createdBy: freezed == createdBy ? _self.createdBy : createdBy // ignore: cast_nullable_to_non_nullable
as EmployeeDto?,
  ));
}

/// Create a copy of InterviewScheduleDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$EmployeeDtoCopyWith<$Res>? get createdBy {
    if (_self.createdBy == null) {
    return null;
  }

  return $EmployeeDtoCopyWith<$Res>(_self.createdBy!, (value) {
    return _then(_self.copyWith(createdBy: value));
  });
}
}

// dart format on
