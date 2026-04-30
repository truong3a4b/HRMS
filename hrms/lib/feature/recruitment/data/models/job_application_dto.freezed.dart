// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'job_application_dto.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$JobApplicationDto {

 String get id; String get status; DateTime get appliedAt; DateTime? get updatedAt; DateTime? get rejectedAt; DateTime? get offerSentAt; DateTime? get offerRespondedAt; DateTime? get onboardedAt; double? get proposedSalary; CandidateDto get candidate; PositionDto get position; DepartmentDto get department; RecruitmentJobDto get recruitmentJob;
/// Create a copy of JobApplicationDto
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$JobApplicationDtoCopyWith<JobApplicationDto> get copyWith => _$JobApplicationDtoCopyWithImpl<JobApplicationDto>(this as JobApplicationDto, _$identity);

  /// Serializes this JobApplicationDto to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is JobApplicationDto&&(identical(other.id, id) || other.id == id)&&(identical(other.status, status) || other.status == status)&&(identical(other.appliedAt, appliedAt) || other.appliedAt == appliedAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.rejectedAt, rejectedAt) || other.rejectedAt == rejectedAt)&&(identical(other.offerSentAt, offerSentAt) || other.offerSentAt == offerSentAt)&&(identical(other.offerRespondedAt, offerRespondedAt) || other.offerRespondedAt == offerRespondedAt)&&(identical(other.onboardedAt, onboardedAt) || other.onboardedAt == onboardedAt)&&(identical(other.proposedSalary, proposedSalary) || other.proposedSalary == proposedSalary)&&(identical(other.candidate, candidate) || other.candidate == candidate)&&(identical(other.position, position) || other.position == position)&&(identical(other.department, department) || other.department == department)&&(identical(other.recruitmentJob, recruitmentJob) || other.recruitmentJob == recruitmentJob));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,status,appliedAt,updatedAt,rejectedAt,offerSentAt,offerRespondedAt,onboardedAt,proposedSalary,candidate,position,department,recruitmentJob);

@override
String toString() {
  return 'JobApplicationDto(id: $id, status: $status, appliedAt: $appliedAt, updatedAt: $updatedAt, rejectedAt: $rejectedAt, offerSentAt: $offerSentAt, offerRespondedAt: $offerRespondedAt, onboardedAt: $onboardedAt, proposedSalary: $proposedSalary, candidate: $candidate, position: $position, department: $department, recruitmentJob: $recruitmentJob)';
}


}

/// @nodoc
abstract mixin class $JobApplicationDtoCopyWith<$Res>  {
  factory $JobApplicationDtoCopyWith(JobApplicationDto value, $Res Function(JobApplicationDto) _then) = _$JobApplicationDtoCopyWithImpl;
@useResult
$Res call({
 String id, String status, DateTime appliedAt, DateTime? updatedAt, DateTime? rejectedAt, DateTime? offerSentAt, DateTime? offerRespondedAt, DateTime? onboardedAt, double? proposedSalary, CandidateDto candidate, PositionDto position, DepartmentDto department, RecruitmentJobDto recruitmentJob
});


$CandidateDtoCopyWith<$Res> get candidate;$PositionDtoCopyWith<$Res> get position;$DepartmentDtoCopyWith<$Res> get department;$RecruitmentJobDtoCopyWith<$Res> get recruitmentJob;

}
/// @nodoc
class _$JobApplicationDtoCopyWithImpl<$Res>
    implements $JobApplicationDtoCopyWith<$Res> {
  _$JobApplicationDtoCopyWithImpl(this._self, this._then);

  final JobApplicationDto _self;
  final $Res Function(JobApplicationDto) _then;

/// Create a copy of JobApplicationDto
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? status = null,Object? appliedAt = null,Object? updatedAt = freezed,Object? rejectedAt = freezed,Object? offerSentAt = freezed,Object? offerRespondedAt = freezed,Object? onboardedAt = freezed,Object? proposedSalary = freezed,Object? candidate = null,Object? position = null,Object? department = null,Object? recruitmentJob = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,appliedAt: null == appliedAt ? _self.appliedAt : appliedAt // ignore: cast_nullable_to_non_nullable
as DateTime,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,rejectedAt: freezed == rejectedAt ? _self.rejectedAt : rejectedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,offerSentAt: freezed == offerSentAt ? _self.offerSentAt : offerSentAt // ignore: cast_nullable_to_non_nullable
as DateTime?,offerRespondedAt: freezed == offerRespondedAt ? _self.offerRespondedAt : offerRespondedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,onboardedAt: freezed == onboardedAt ? _self.onboardedAt : onboardedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,proposedSalary: freezed == proposedSalary ? _self.proposedSalary : proposedSalary // ignore: cast_nullable_to_non_nullable
as double?,candidate: null == candidate ? _self.candidate : candidate // ignore: cast_nullable_to_non_nullable
as CandidateDto,position: null == position ? _self.position : position // ignore: cast_nullable_to_non_nullable
as PositionDto,department: null == department ? _self.department : department // ignore: cast_nullable_to_non_nullable
as DepartmentDto,recruitmentJob: null == recruitmentJob ? _self.recruitmentJob : recruitmentJob // ignore: cast_nullable_to_non_nullable
as RecruitmentJobDto,
  ));
}
/// Create a copy of JobApplicationDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$CandidateDtoCopyWith<$Res> get candidate {
  
  return $CandidateDtoCopyWith<$Res>(_self.candidate, (value) {
    return _then(_self.copyWith(candidate: value));
  });
}/// Create a copy of JobApplicationDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PositionDtoCopyWith<$Res> get position {
  
  return $PositionDtoCopyWith<$Res>(_self.position, (value) {
    return _then(_self.copyWith(position: value));
  });
}/// Create a copy of JobApplicationDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$DepartmentDtoCopyWith<$Res> get department {
  
  return $DepartmentDtoCopyWith<$Res>(_self.department, (value) {
    return _then(_self.copyWith(department: value));
  });
}/// Create a copy of JobApplicationDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$RecruitmentJobDtoCopyWith<$Res> get recruitmentJob {
  
  return $RecruitmentJobDtoCopyWith<$Res>(_self.recruitmentJob, (value) {
    return _then(_self.copyWith(recruitmentJob: value));
  });
}
}


/// Adds pattern-matching-related methods to [JobApplicationDto].
extension JobApplicationDtoPatterns on JobApplicationDto {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _JobApplicationDto value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _JobApplicationDto() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _JobApplicationDto value)  $default,){
final _that = this;
switch (_that) {
case _JobApplicationDto():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _JobApplicationDto value)?  $default,){
final _that = this;
switch (_that) {
case _JobApplicationDto() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String status,  DateTime appliedAt,  DateTime? updatedAt,  DateTime? rejectedAt,  DateTime? offerSentAt,  DateTime? offerRespondedAt,  DateTime? onboardedAt,  double? proposedSalary,  CandidateDto candidate,  PositionDto position,  DepartmentDto department,  RecruitmentJobDto recruitmentJob)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _JobApplicationDto() when $default != null:
return $default(_that.id,_that.status,_that.appliedAt,_that.updatedAt,_that.rejectedAt,_that.offerSentAt,_that.offerRespondedAt,_that.onboardedAt,_that.proposedSalary,_that.candidate,_that.position,_that.department,_that.recruitmentJob);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String status,  DateTime appliedAt,  DateTime? updatedAt,  DateTime? rejectedAt,  DateTime? offerSentAt,  DateTime? offerRespondedAt,  DateTime? onboardedAt,  double? proposedSalary,  CandidateDto candidate,  PositionDto position,  DepartmentDto department,  RecruitmentJobDto recruitmentJob)  $default,) {final _that = this;
switch (_that) {
case _JobApplicationDto():
return $default(_that.id,_that.status,_that.appliedAt,_that.updatedAt,_that.rejectedAt,_that.offerSentAt,_that.offerRespondedAt,_that.onboardedAt,_that.proposedSalary,_that.candidate,_that.position,_that.department,_that.recruitmentJob);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String status,  DateTime appliedAt,  DateTime? updatedAt,  DateTime? rejectedAt,  DateTime? offerSentAt,  DateTime? offerRespondedAt,  DateTime? onboardedAt,  double? proposedSalary,  CandidateDto candidate,  PositionDto position,  DepartmentDto department,  RecruitmentJobDto recruitmentJob)?  $default,) {final _that = this;
switch (_that) {
case _JobApplicationDto() when $default != null:
return $default(_that.id,_that.status,_that.appliedAt,_that.updatedAt,_that.rejectedAt,_that.offerSentAt,_that.offerRespondedAt,_that.onboardedAt,_that.proposedSalary,_that.candidate,_that.position,_that.department,_that.recruitmentJob);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _JobApplicationDto implements JobApplicationDto {
  const _JobApplicationDto({required this.id, required this.status, required this.appliedAt, this.updatedAt, this.rejectedAt, this.offerSentAt, this.offerRespondedAt, this.onboardedAt, this.proposedSalary, required this.candidate, required this.position, required this.department, required this.recruitmentJob});
  factory _JobApplicationDto.fromJson(Map<String, dynamic> json) => _$JobApplicationDtoFromJson(json);

@override final  String id;
@override final  String status;
@override final  DateTime appliedAt;
@override final  DateTime? updatedAt;
@override final  DateTime? rejectedAt;
@override final  DateTime? offerSentAt;
@override final  DateTime? offerRespondedAt;
@override final  DateTime? onboardedAt;
@override final  double? proposedSalary;
@override final  CandidateDto candidate;
@override final  PositionDto position;
@override final  DepartmentDto department;
@override final  RecruitmentJobDto recruitmentJob;

/// Create a copy of JobApplicationDto
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$JobApplicationDtoCopyWith<_JobApplicationDto> get copyWith => __$JobApplicationDtoCopyWithImpl<_JobApplicationDto>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$JobApplicationDtoToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _JobApplicationDto&&(identical(other.id, id) || other.id == id)&&(identical(other.status, status) || other.status == status)&&(identical(other.appliedAt, appliedAt) || other.appliedAt == appliedAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.rejectedAt, rejectedAt) || other.rejectedAt == rejectedAt)&&(identical(other.offerSentAt, offerSentAt) || other.offerSentAt == offerSentAt)&&(identical(other.offerRespondedAt, offerRespondedAt) || other.offerRespondedAt == offerRespondedAt)&&(identical(other.onboardedAt, onboardedAt) || other.onboardedAt == onboardedAt)&&(identical(other.proposedSalary, proposedSalary) || other.proposedSalary == proposedSalary)&&(identical(other.candidate, candidate) || other.candidate == candidate)&&(identical(other.position, position) || other.position == position)&&(identical(other.department, department) || other.department == department)&&(identical(other.recruitmentJob, recruitmentJob) || other.recruitmentJob == recruitmentJob));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,status,appliedAt,updatedAt,rejectedAt,offerSentAt,offerRespondedAt,onboardedAt,proposedSalary,candidate,position,department,recruitmentJob);

@override
String toString() {
  return 'JobApplicationDto(id: $id, status: $status, appliedAt: $appliedAt, updatedAt: $updatedAt, rejectedAt: $rejectedAt, offerSentAt: $offerSentAt, offerRespondedAt: $offerRespondedAt, onboardedAt: $onboardedAt, proposedSalary: $proposedSalary, candidate: $candidate, position: $position, department: $department, recruitmentJob: $recruitmentJob)';
}


}

/// @nodoc
abstract mixin class _$JobApplicationDtoCopyWith<$Res> implements $JobApplicationDtoCopyWith<$Res> {
  factory _$JobApplicationDtoCopyWith(_JobApplicationDto value, $Res Function(_JobApplicationDto) _then) = __$JobApplicationDtoCopyWithImpl;
@override @useResult
$Res call({
 String id, String status, DateTime appliedAt, DateTime? updatedAt, DateTime? rejectedAt, DateTime? offerSentAt, DateTime? offerRespondedAt, DateTime? onboardedAt, double? proposedSalary, CandidateDto candidate, PositionDto position, DepartmentDto department, RecruitmentJobDto recruitmentJob
});


@override $CandidateDtoCopyWith<$Res> get candidate;@override $PositionDtoCopyWith<$Res> get position;@override $DepartmentDtoCopyWith<$Res> get department;@override $RecruitmentJobDtoCopyWith<$Res> get recruitmentJob;

}
/// @nodoc
class __$JobApplicationDtoCopyWithImpl<$Res>
    implements _$JobApplicationDtoCopyWith<$Res> {
  __$JobApplicationDtoCopyWithImpl(this._self, this._then);

  final _JobApplicationDto _self;
  final $Res Function(_JobApplicationDto) _then;

/// Create a copy of JobApplicationDto
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? status = null,Object? appliedAt = null,Object? updatedAt = freezed,Object? rejectedAt = freezed,Object? offerSentAt = freezed,Object? offerRespondedAt = freezed,Object? onboardedAt = freezed,Object? proposedSalary = freezed,Object? candidate = null,Object? position = null,Object? department = null,Object? recruitmentJob = null,}) {
  return _then(_JobApplicationDto(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,appliedAt: null == appliedAt ? _self.appliedAt : appliedAt // ignore: cast_nullable_to_non_nullable
as DateTime,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,rejectedAt: freezed == rejectedAt ? _self.rejectedAt : rejectedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,offerSentAt: freezed == offerSentAt ? _self.offerSentAt : offerSentAt // ignore: cast_nullable_to_non_nullable
as DateTime?,offerRespondedAt: freezed == offerRespondedAt ? _self.offerRespondedAt : offerRespondedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,onboardedAt: freezed == onboardedAt ? _self.onboardedAt : onboardedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,proposedSalary: freezed == proposedSalary ? _self.proposedSalary : proposedSalary // ignore: cast_nullable_to_non_nullable
as double?,candidate: null == candidate ? _self.candidate : candidate // ignore: cast_nullable_to_non_nullable
as CandidateDto,position: null == position ? _self.position : position // ignore: cast_nullable_to_non_nullable
as PositionDto,department: null == department ? _self.department : department // ignore: cast_nullable_to_non_nullable
as DepartmentDto,recruitmentJob: null == recruitmentJob ? _self.recruitmentJob : recruitmentJob // ignore: cast_nullable_to_non_nullable
as RecruitmentJobDto,
  ));
}

/// Create a copy of JobApplicationDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$CandidateDtoCopyWith<$Res> get candidate {
  
  return $CandidateDtoCopyWith<$Res>(_self.candidate, (value) {
    return _then(_self.copyWith(candidate: value));
  });
}/// Create a copy of JobApplicationDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PositionDtoCopyWith<$Res> get position {
  
  return $PositionDtoCopyWith<$Res>(_self.position, (value) {
    return _then(_self.copyWith(position: value));
  });
}/// Create a copy of JobApplicationDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$DepartmentDtoCopyWith<$Res> get department {
  
  return $DepartmentDtoCopyWith<$Res>(_self.department, (value) {
    return _then(_self.copyWith(department: value));
  });
}/// Create a copy of JobApplicationDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$RecruitmentJobDtoCopyWith<$Res> get recruitmentJob {
  
  return $RecruitmentJobDtoCopyWith<$Res>(_self.recruitmentJob, (value) {
    return _then(_self.copyWith(recruitmentJob: value));
  });
}
}

// dart format on
