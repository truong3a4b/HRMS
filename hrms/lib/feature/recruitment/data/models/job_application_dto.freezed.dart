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

 String get id; String? get candidateId; String? get recruitmentJobId; String? get positionId; String? get departmentId; String? get candidateAvatar; String? get candidateName; String? get candidateEmail; String? get candidatePhone; String? get candidateAddress; String? get candidateGender; DateTime? get candidateBirthDate; String? get candidateCvUrl; String get status; double? get proposedSalary; DateTime? get proposedHireDate; String? get coverLetter; String? get notes; DateTime get appliedAt; DateTime? get updatedAt; DateTime? get rejectedAt; DateTime? get offerSentAt; DateTime? get offerRespondedAt; DateTime? get onboardedAt; PositionDto get position; DepartmentDto get department; RecruitmentJobDto get recruitmentJob; List<InterviewScheduleDto> get interviewSchedules; List<InterviewEvaluationDto> get evaluations;
/// Create a copy of JobApplicationDto
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$JobApplicationDtoCopyWith<JobApplicationDto> get copyWith => _$JobApplicationDtoCopyWithImpl<JobApplicationDto>(this as JobApplicationDto, _$identity);

  /// Serializes this JobApplicationDto to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is JobApplicationDto&&(identical(other.id, id) || other.id == id)&&(identical(other.candidateId, candidateId) || other.candidateId == candidateId)&&(identical(other.recruitmentJobId, recruitmentJobId) || other.recruitmentJobId == recruitmentJobId)&&(identical(other.positionId, positionId) || other.positionId == positionId)&&(identical(other.departmentId, departmentId) || other.departmentId == departmentId)&&(identical(other.candidateAvatar, candidateAvatar) || other.candidateAvatar == candidateAvatar)&&(identical(other.candidateName, candidateName) || other.candidateName == candidateName)&&(identical(other.candidateEmail, candidateEmail) || other.candidateEmail == candidateEmail)&&(identical(other.candidatePhone, candidatePhone) || other.candidatePhone == candidatePhone)&&(identical(other.candidateAddress, candidateAddress) || other.candidateAddress == candidateAddress)&&(identical(other.candidateGender, candidateGender) || other.candidateGender == candidateGender)&&(identical(other.candidateBirthDate, candidateBirthDate) || other.candidateBirthDate == candidateBirthDate)&&(identical(other.candidateCvUrl, candidateCvUrl) || other.candidateCvUrl == candidateCvUrl)&&(identical(other.status, status) || other.status == status)&&(identical(other.proposedSalary, proposedSalary) || other.proposedSalary == proposedSalary)&&(identical(other.proposedHireDate, proposedHireDate) || other.proposedHireDate == proposedHireDate)&&(identical(other.coverLetter, coverLetter) || other.coverLetter == coverLetter)&&(identical(other.notes, notes) || other.notes == notes)&&(identical(other.appliedAt, appliedAt) || other.appliedAt == appliedAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.rejectedAt, rejectedAt) || other.rejectedAt == rejectedAt)&&(identical(other.offerSentAt, offerSentAt) || other.offerSentAt == offerSentAt)&&(identical(other.offerRespondedAt, offerRespondedAt) || other.offerRespondedAt == offerRespondedAt)&&(identical(other.onboardedAt, onboardedAt) || other.onboardedAt == onboardedAt)&&(identical(other.position, position) || other.position == position)&&(identical(other.department, department) || other.department == department)&&(identical(other.recruitmentJob, recruitmentJob) || other.recruitmentJob == recruitmentJob)&&const DeepCollectionEquality().equals(other.interviewSchedules, interviewSchedules)&&const DeepCollectionEquality().equals(other.evaluations, evaluations));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,candidateId,recruitmentJobId,positionId,departmentId,candidateAvatar,candidateName,candidateEmail,candidatePhone,candidateAddress,candidateGender,candidateBirthDate,candidateCvUrl,status,proposedSalary,proposedHireDate,coverLetter,notes,appliedAt,updatedAt,rejectedAt,offerSentAt,offerRespondedAt,onboardedAt,position,department,recruitmentJob,const DeepCollectionEquality().hash(interviewSchedules),const DeepCollectionEquality().hash(evaluations)]);

@override
String toString() {
  return 'JobApplicationDto(id: $id, candidateId: $candidateId, recruitmentJobId: $recruitmentJobId, positionId: $positionId, departmentId: $departmentId, candidateAvatar: $candidateAvatar, candidateName: $candidateName, candidateEmail: $candidateEmail, candidatePhone: $candidatePhone, candidateAddress: $candidateAddress, candidateGender: $candidateGender, candidateBirthDate: $candidateBirthDate, candidateCvUrl: $candidateCvUrl, status: $status, proposedSalary: $proposedSalary, proposedHireDate: $proposedHireDate, coverLetter: $coverLetter, notes: $notes, appliedAt: $appliedAt, updatedAt: $updatedAt, rejectedAt: $rejectedAt, offerSentAt: $offerSentAt, offerRespondedAt: $offerRespondedAt, onboardedAt: $onboardedAt, position: $position, department: $department, recruitmentJob: $recruitmentJob, interviewSchedules: $interviewSchedules, evaluations: $evaluations)';
}


}

/// @nodoc
abstract mixin class $JobApplicationDtoCopyWith<$Res>  {
  factory $JobApplicationDtoCopyWith(JobApplicationDto value, $Res Function(JobApplicationDto) _then) = _$JobApplicationDtoCopyWithImpl;
@useResult
$Res call({
 String id, String? candidateId, String? recruitmentJobId, String? positionId, String? departmentId, String? candidateAvatar, String? candidateName, String? candidateEmail, String? candidatePhone, String? candidateAddress, String? candidateGender, DateTime? candidateBirthDate, String? candidateCvUrl, String status, double? proposedSalary, DateTime? proposedHireDate, String? coverLetter, String? notes, DateTime appliedAt, DateTime? updatedAt, DateTime? rejectedAt, DateTime? offerSentAt, DateTime? offerRespondedAt, DateTime? onboardedAt, PositionDto position, DepartmentDto department, RecruitmentJobDto recruitmentJob, List<InterviewScheduleDto> interviewSchedules, List<InterviewEvaluationDto> evaluations
});


$PositionDtoCopyWith<$Res> get position;$DepartmentDtoCopyWith<$Res> get department;$RecruitmentJobDtoCopyWith<$Res> get recruitmentJob;

}
/// @nodoc
class _$JobApplicationDtoCopyWithImpl<$Res>
    implements $JobApplicationDtoCopyWith<$Res> {
  _$JobApplicationDtoCopyWithImpl(this._self, this._then);

  final JobApplicationDto _self;
  final $Res Function(JobApplicationDto) _then;

/// Create a copy of JobApplicationDto
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? candidateId = freezed,Object? recruitmentJobId = freezed,Object? positionId = freezed,Object? departmentId = freezed,Object? candidateAvatar = freezed,Object? candidateName = freezed,Object? candidateEmail = freezed,Object? candidatePhone = freezed,Object? candidateAddress = freezed,Object? candidateGender = freezed,Object? candidateBirthDate = freezed,Object? candidateCvUrl = freezed,Object? status = null,Object? proposedSalary = freezed,Object? proposedHireDate = freezed,Object? coverLetter = freezed,Object? notes = freezed,Object? appliedAt = null,Object? updatedAt = freezed,Object? rejectedAt = freezed,Object? offerSentAt = freezed,Object? offerRespondedAt = freezed,Object? onboardedAt = freezed,Object? position = null,Object? department = null,Object? recruitmentJob = null,Object? interviewSchedules = null,Object? evaluations = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,candidateId: freezed == candidateId ? _self.candidateId : candidateId // ignore: cast_nullable_to_non_nullable
as String?,recruitmentJobId: freezed == recruitmentJobId ? _self.recruitmentJobId : recruitmentJobId // ignore: cast_nullable_to_non_nullable
as String?,positionId: freezed == positionId ? _self.positionId : positionId // ignore: cast_nullable_to_non_nullable
as String?,departmentId: freezed == departmentId ? _self.departmentId : departmentId // ignore: cast_nullable_to_non_nullable
as String?,candidateAvatar: freezed == candidateAvatar ? _self.candidateAvatar : candidateAvatar // ignore: cast_nullable_to_non_nullable
as String?,candidateName: freezed == candidateName ? _self.candidateName : candidateName // ignore: cast_nullable_to_non_nullable
as String?,candidateEmail: freezed == candidateEmail ? _self.candidateEmail : candidateEmail // ignore: cast_nullable_to_non_nullable
as String?,candidatePhone: freezed == candidatePhone ? _self.candidatePhone : candidatePhone // ignore: cast_nullable_to_non_nullable
as String?,candidateAddress: freezed == candidateAddress ? _self.candidateAddress : candidateAddress // ignore: cast_nullable_to_non_nullable
as String?,candidateGender: freezed == candidateGender ? _self.candidateGender : candidateGender // ignore: cast_nullable_to_non_nullable
as String?,candidateBirthDate: freezed == candidateBirthDate ? _self.candidateBirthDate : candidateBirthDate // ignore: cast_nullable_to_non_nullable
as DateTime?,candidateCvUrl: freezed == candidateCvUrl ? _self.candidateCvUrl : candidateCvUrl // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,proposedSalary: freezed == proposedSalary ? _self.proposedSalary : proposedSalary // ignore: cast_nullable_to_non_nullable
as double?,proposedHireDate: freezed == proposedHireDate ? _self.proposedHireDate : proposedHireDate // ignore: cast_nullable_to_non_nullable
as DateTime?,coverLetter: freezed == coverLetter ? _self.coverLetter : coverLetter // ignore: cast_nullable_to_non_nullable
as String?,notes: freezed == notes ? _self.notes : notes // ignore: cast_nullable_to_non_nullable
as String?,appliedAt: null == appliedAt ? _self.appliedAt : appliedAt // ignore: cast_nullable_to_non_nullable
as DateTime,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,rejectedAt: freezed == rejectedAt ? _self.rejectedAt : rejectedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,offerSentAt: freezed == offerSentAt ? _self.offerSentAt : offerSentAt // ignore: cast_nullable_to_non_nullable
as DateTime?,offerRespondedAt: freezed == offerRespondedAt ? _self.offerRespondedAt : offerRespondedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,onboardedAt: freezed == onboardedAt ? _self.onboardedAt : onboardedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,position: null == position ? _self.position : position // ignore: cast_nullable_to_non_nullable
as PositionDto,department: null == department ? _self.department : department // ignore: cast_nullable_to_non_nullable
as DepartmentDto,recruitmentJob: null == recruitmentJob ? _self.recruitmentJob : recruitmentJob // ignore: cast_nullable_to_non_nullable
as RecruitmentJobDto,interviewSchedules: null == interviewSchedules ? _self.interviewSchedules : interviewSchedules // ignore: cast_nullable_to_non_nullable
as List<InterviewScheduleDto>,evaluations: null == evaluations ? _self.evaluations : evaluations // ignore: cast_nullable_to_non_nullable
as List<InterviewEvaluationDto>,
  ));
}
/// Create a copy of JobApplicationDto
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String? candidateId,  String? recruitmentJobId,  String? positionId,  String? departmentId,  String? candidateAvatar,  String? candidateName,  String? candidateEmail,  String? candidatePhone,  String? candidateAddress,  String? candidateGender,  DateTime? candidateBirthDate,  String? candidateCvUrl,  String status,  double? proposedSalary,  DateTime? proposedHireDate,  String? coverLetter,  String? notes,  DateTime appliedAt,  DateTime? updatedAt,  DateTime? rejectedAt,  DateTime? offerSentAt,  DateTime? offerRespondedAt,  DateTime? onboardedAt,  PositionDto position,  DepartmentDto department,  RecruitmentJobDto recruitmentJob,  List<InterviewScheduleDto> interviewSchedules,  List<InterviewEvaluationDto> evaluations)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _JobApplicationDto() when $default != null:
return $default(_that.id,_that.candidateId,_that.recruitmentJobId,_that.positionId,_that.departmentId,_that.candidateAvatar,_that.candidateName,_that.candidateEmail,_that.candidatePhone,_that.candidateAddress,_that.candidateGender,_that.candidateBirthDate,_that.candidateCvUrl,_that.status,_that.proposedSalary,_that.proposedHireDate,_that.coverLetter,_that.notes,_that.appliedAt,_that.updatedAt,_that.rejectedAt,_that.offerSentAt,_that.offerRespondedAt,_that.onboardedAt,_that.position,_that.department,_that.recruitmentJob,_that.interviewSchedules,_that.evaluations);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String? candidateId,  String? recruitmentJobId,  String? positionId,  String? departmentId,  String? candidateAvatar,  String? candidateName,  String? candidateEmail,  String? candidatePhone,  String? candidateAddress,  String? candidateGender,  DateTime? candidateBirthDate,  String? candidateCvUrl,  String status,  double? proposedSalary,  DateTime? proposedHireDate,  String? coverLetter,  String? notes,  DateTime appliedAt,  DateTime? updatedAt,  DateTime? rejectedAt,  DateTime? offerSentAt,  DateTime? offerRespondedAt,  DateTime? onboardedAt,  PositionDto position,  DepartmentDto department,  RecruitmentJobDto recruitmentJob,  List<InterviewScheduleDto> interviewSchedules,  List<InterviewEvaluationDto> evaluations)  $default,) {final _that = this;
switch (_that) {
case _JobApplicationDto():
return $default(_that.id,_that.candidateId,_that.recruitmentJobId,_that.positionId,_that.departmentId,_that.candidateAvatar,_that.candidateName,_that.candidateEmail,_that.candidatePhone,_that.candidateAddress,_that.candidateGender,_that.candidateBirthDate,_that.candidateCvUrl,_that.status,_that.proposedSalary,_that.proposedHireDate,_that.coverLetter,_that.notes,_that.appliedAt,_that.updatedAt,_that.rejectedAt,_that.offerSentAt,_that.offerRespondedAt,_that.onboardedAt,_that.position,_that.department,_that.recruitmentJob,_that.interviewSchedules,_that.evaluations);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String? candidateId,  String? recruitmentJobId,  String? positionId,  String? departmentId,  String? candidateAvatar,  String? candidateName,  String? candidateEmail,  String? candidatePhone,  String? candidateAddress,  String? candidateGender,  DateTime? candidateBirthDate,  String? candidateCvUrl,  String status,  double? proposedSalary,  DateTime? proposedHireDate,  String? coverLetter,  String? notes,  DateTime appliedAt,  DateTime? updatedAt,  DateTime? rejectedAt,  DateTime? offerSentAt,  DateTime? offerRespondedAt,  DateTime? onboardedAt,  PositionDto position,  DepartmentDto department,  RecruitmentJobDto recruitmentJob,  List<InterviewScheduleDto> interviewSchedules,  List<InterviewEvaluationDto> evaluations)?  $default,) {final _that = this;
switch (_that) {
case _JobApplicationDto() when $default != null:
return $default(_that.id,_that.candidateId,_that.recruitmentJobId,_that.positionId,_that.departmentId,_that.candidateAvatar,_that.candidateName,_that.candidateEmail,_that.candidatePhone,_that.candidateAddress,_that.candidateGender,_that.candidateBirthDate,_that.candidateCvUrl,_that.status,_that.proposedSalary,_that.proposedHireDate,_that.coverLetter,_that.notes,_that.appliedAt,_that.updatedAt,_that.rejectedAt,_that.offerSentAt,_that.offerRespondedAt,_that.onboardedAt,_that.position,_that.department,_that.recruitmentJob,_that.interviewSchedules,_that.evaluations);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _JobApplicationDto implements JobApplicationDto {
  const _JobApplicationDto({required this.id, this.candidateId, this.recruitmentJobId, this.positionId, this.departmentId, this.candidateAvatar, this.candidateName, this.candidateEmail, this.candidatePhone, this.candidateAddress, this.candidateGender, this.candidateBirthDate, this.candidateCvUrl, required this.status, this.proposedSalary, this.proposedHireDate, this.coverLetter, this.notes, required this.appliedAt, this.updatedAt, this.rejectedAt, this.offerSentAt, this.offerRespondedAt, this.onboardedAt, required this.position, required this.department, required this.recruitmentJob, final  List<InterviewScheduleDto> interviewSchedules = const [], final  List<InterviewEvaluationDto> evaluations = const []}): _interviewSchedules = interviewSchedules,_evaluations = evaluations;
  factory _JobApplicationDto.fromJson(Map<String, dynamic> json) => _$JobApplicationDtoFromJson(json);

@override final  String id;
@override final  String? candidateId;
@override final  String? recruitmentJobId;
@override final  String? positionId;
@override final  String? departmentId;
@override final  String? candidateAvatar;
@override final  String? candidateName;
@override final  String? candidateEmail;
@override final  String? candidatePhone;
@override final  String? candidateAddress;
@override final  String? candidateGender;
@override final  DateTime? candidateBirthDate;
@override final  String? candidateCvUrl;
@override final  String status;
@override final  double? proposedSalary;
@override final  DateTime? proposedHireDate;
@override final  String? coverLetter;
@override final  String? notes;
@override final  DateTime appliedAt;
@override final  DateTime? updatedAt;
@override final  DateTime? rejectedAt;
@override final  DateTime? offerSentAt;
@override final  DateTime? offerRespondedAt;
@override final  DateTime? onboardedAt;
@override final  PositionDto position;
@override final  DepartmentDto department;
@override final  RecruitmentJobDto recruitmentJob;
 final  List<InterviewScheduleDto> _interviewSchedules;
@override@JsonKey() List<InterviewScheduleDto> get interviewSchedules {
  if (_interviewSchedules is EqualUnmodifiableListView) return _interviewSchedules;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_interviewSchedules);
}

 final  List<InterviewEvaluationDto> _evaluations;
@override@JsonKey() List<InterviewEvaluationDto> get evaluations {
  if (_evaluations is EqualUnmodifiableListView) return _evaluations;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_evaluations);
}


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
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _JobApplicationDto&&(identical(other.id, id) || other.id == id)&&(identical(other.candidateId, candidateId) || other.candidateId == candidateId)&&(identical(other.recruitmentJobId, recruitmentJobId) || other.recruitmentJobId == recruitmentJobId)&&(identical(other.positionId, positionId) || other.positionId == positionId)&&(identical(other.departmentId, departmentId) || other.departmentId == departmentId)&&(identical(other.candidateAvatar, candidateAvatar) || other.candidateAvatar == candidateAvatar)&&(identical(other.candidateName, candidateName) || other.candidateName == candidateName)&&(identical(other.candidateEmail, candidateEmail) || other.candidateEmail == candidateEmail)&&(identical(other.candidatePhone, candidatePhone) || other.candidatePhone == candidatePhone)&&(identical(other.candidateAddress, candidateAddress) || other.candidateAddress == candidateAddress)&&(identical(other.candidateGender, candidateGender) || other.candidateGender == candidateGender)&&(identical(other.candidateBirthDate, candidateBirthDate) || other.candidateBirthDate == candidateBirthDate)&&(identical(other.candidateCvUrl, candidateCvUrl) || other.candidateCvUrl == candidateCvUrl)&&(identical(other.status, status) || other.status == status)&&(identical(other.proposedSalary, proposedSalary) || other.proposedSalary == proposedSalary)&&(identical(other.proposedHireDate, proposedHireDate) || other.proposedHireDate == proposedHireDate)&&(identical(other.coverLetter, coverLetter) || other.coverLetter == coverLetter)&&(identical(other.notes, notes) || other.notes == notes)&&(identical(other.appliedAt, appliedAt) || other.appliedAt == appliedAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.rejectedAt, rejectedAt) || other.rejectedAt == rejectedAt)&&(identical(other.offerSentAt, offerSentAt) || other.offerSentAt == offerSentAt)&&(identical(other.offerRespondedAt, offerRespondedAt) || other.offerRespondedAt == offerRespondedAt)&&(identical(other.onboardedAt, onboardedAt) || other.onboardedAt == onboardedAt)&&(identical(other.position, position) || other.position == position)&&(identical(other.department, department) || other.department == department)&&(identical(other.recruitmentJob, recruitmentJob) || other.recruitmentJob == recruitmentJob)&&const DeepCollectionEquality().equals(other._interviewSchedules, _interviewSchedules)&&const DeepCollectionEquality().equals(other._evaluations, _evaluations));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,candidateId,recruitmentJobId,positionId,departmentId,candidateAvatar,candidateName,candidateEmail,candidatePhone,candidateAddress,candidateGender,candidateBirthDate,candidateCvUrl,status,proposedSalary,proposedHireDate,coverLetter,notes,appliedAt,updatedAt,rejectedAt,offerSentAt,offerRespondedAt,onboardedAt,position,department,recruitmentJob,const DeepCollectionEquality().hash(_interviewSchedules),const DeepCollectionEquality().hash(_evaluations)]);

@override
String toString() {
  return 'JobApplicationDto(id: $id, candidateId: $candidateId, recruitmentJobId: $recruitmentJobId, positionId: $positionId, departmentId: $departmentId, candidateAvatar: $candidateAvatar, candidateName: $candidateName, candidateEmail: $candidateEmail, candidatePhone: $candidatePhone, candidateAddress: $candidateAddress, candidateGender: $candidateGender, candidateBirthDate: $candidateBirthDate, candidateCvUrl: $candidateCvUrl, status: $status, proposedSalary: $proposedSalary, proposedHireDate: $proposedHireDate, coverLetter: $coverLetter, notes: $notes, appliedAt: $appliedAt, updatedAt: $updatedAt, rejectedAt: $rejectedAt, offerSentAt: $offerSentAt, offerRespondedAt: $offerRespondedAt, onboardedAt: $onboardedAt, position: $position, department: $department, recruitmentJob: $recruitmentJob, interviewSchedules: $interviewSchedules, evaluations: $evaluations)';
}


}

/// @nodoc
abstract mixin class _$JobApplicationDtoCopyWith<$Res> implements $JobApplicationDtoCopyWith<$Res> {
  factory _$JobApplicationDtoCopyWith(_JobApplicationDto value, $Res Function(_JobApplicationDto) _then) = __$JobApplicationDtoCopyWithImpl;
@override @useResult
$Res call({
 String id, String? candidateId, String? recruitmentJobId, String? positionId, String? departmentId, String? candidateAvatar, String? candidateName, String? candidateEmail, String? candidatePhone, String? candidateAddress, String? candidateGender, DateTime? candidateBirthDate, String? candidateCvUrl, String status, double? proposedSalary, DateTime? proposedHireDate, String? coverLetter, String? notes, DateTime appliedAt, DateTime? updatedAt, DateTime? rejectedAt, DateTime? offerSentAt, DateTime? offerRespondedAt, DateTime? onboardedAt, PositionDto position, DepartmentDto department, RecruitmentJobDto recruitmentJob, List<InterviewScheduleDto> interviewSchedules, List<InterviewEvaluationDto> evaluations
});


@override $PositionDtoCopyWith<$Res> get position;@override $DepartmentDtoCopyWith<$Res> get department;@override $RecruitmentJobDtoCopyWith<$Res> get recruitmentJob;

}
/// @nodoc
class __$JobApplicationDtoCopyWithImpl<$Res>
    implements _$JobApplicationDtoCopyWith<$Res> {
  __$JobApplicationDtoCopyWithImpl(this._self, this._then);

  final _JobApplicationDto _self;
  final $Res Function(_JobApplicationDto) _then;

/// Create a copy of JobApplicationDto
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? candidateId = freezed,Object? recruitmentJobId = freezed,Object? positionId = freezed,Object? departmentId = freezed,Object? candidateAvatar = freezed,Object? candidateName = freezed,Object? candidateEmail = freezed,Object? candidatePhone = freezed,Object? candidateAddress = freezed,Object? candidateGender = freezed,Object? candidateBirthDate = freezed,Object? candidateCvUrl = freezed,Object? status = null,Object? proposedSalary = freezed,Object? proposedHireDate = freezed,Object? coverLetter = freezed,Object? notes = freezed,Object? appliedAt = null,Object? updatedAt = freezed,Object? rejectedAt = freezed,Object? offerSentAt = freezed,Object? offerRespondedAt = freezed,Object? onboardedAt = freezed,Object? position = null,Object? department = null,Object? recruitmentJob = null,Object? interviewSchedules = null,Object? evaluations = null,}) {
  return _then(_JobApplicationDto(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,candidateId: freezed == candidateId ? _self.candidateId : candidateId // ignore: cast_nullable_to_non_nullable
as String?,recruitmentJobId: freezed == recruitmentJobId ? _self.recruitmentJobId : recruitmentJobId // ignore: cast_nullable_to_non_nullable
as String?,positionId: freezed == positionId ? _self.positionId : positionId // ignore: cast_nullable_to_non_nullable
as String?,departmentId: freezed == departmentId ? _self.departmentId : departmentId // ignore: cast_nullable_to_non_nullable
as String?,candidateAvatar: freezed == candidateAvatar ? _self.candidateAvatar : candidateAvatar // ignore: cast_nullable_to_non_nullable
as String?,candidateName: freezed == candidateName ? _self.candidateName : candidateName // ignore: cast_nullable_to_non_nullable
as String?,candidateEmail: freezed == candidateEmail ? _self.candidateEmail : candidateEmail // ignore: cast_nullable_to_non_nullable
as String?,candidatePhone: freezed == candidatePhone ? _self.candidatePhone : candidatePhone // ignore: cast_nullable_to_non_nullable
as String?,candidateAddress: freezed == candidateAddress ? _self.candidateAddress : candidateAddress // ignore: cast_nullable_to_non_nullable
as String?,candidateGender: freezed == candidateGender ? _self.candidateGender : candidateGender // ignore: cast_nullable_to_non_nullable
as String?,candidateBirthDate: freezed == candidateBirthDate ? _self.candidateBirthDate : candidateBirthDate // ignore: cast_nullable_to_non_nullable
as DateTime?,candidateCvUrl: freezed == candidateCvUrl ? _self.candidateCvUrl : candidateCvUrl // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,proposedSalary: freezed == proposedSalary ? _self.proposedSalary : proposedSalary // ignore: cast_nullable_to_non_nullable
as double?,proposedHireDate: freezed == proposedHireDate ? _self.proposedHireDate : proposedHireDate // ignore: cast_nullable_to_non_nullable
as DateTime?,coverLetter: freezed == coverLetter ? _self.coverLetter : coverLetter // ignore: cast_nullable_to_non_nullable
as String?,notes: freezed == notes ? _self.notes : notes // ignore: cast_nullable_to_non_nullable
as String?,appliedAt: null == appliedAt ? _self.appliedAt : appliedAt // ignore: cast_nullable_to_non_nullable
as DateTime,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,rejectedAt: freezed == rejectedAt ? _self.rejectedAt : rejectedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,offerSentAt: freezed == offerSentAt ? _self.offerSentAt : offerSentAt // ignore: cast_nullable_to_non_nullable
as DateTime?,offerRespondedAt: freezed == offerRespondedAt ? _self.offerRespondedAt : offerRespondedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,onboardedAt: freezed == onboardedAt ? _self.onboardedAt : onboardedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,position: null == position ? _self.position : position // ignore: cast_nullable_to_non_nullable
as PositionDto,department: null == department ? _self.department : department // ignore: cast_nullable_to_non_nullable
as DepartmentDto,recruitmentJob: null == recruitmentJob ? _self.recruitmentJob : recruitmentJob // ignore: cast_nullable_to_non_nullable
as RecruitmentJobDto,interviewSchedules: null == interviewSchedules ? _self._interviewSchedules : interviewSchedules // ignore: cast_nullable_to_non_nullable
as List<InterviewScheduleDto>,evaluations: null == evaluations ? _self._evaluations : evaluations // ignore: cast_nullable_to_non_nullable
as List<InterviewEvaluationDto>,
  ));
}

/// Create a copy of JobApplicationDto
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
