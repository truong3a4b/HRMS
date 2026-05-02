// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'interview_evaluation_dto.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$InterviewEvaluationDto {

 String get id; String? get jobApplicationId; String? get evaluatorEmployeeId; String? get title; int? get score; String? get strengths; String? get concerns; String? get recommendation; String? get comments; DateTime? get createdAt; DateTime? get updatedAt; EmployeeDto? get evaluator;
/// Create a copy of InterviewEvaluationDto
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$InterviewEvaluationDtoCopyWith<InterviewEvaluationDto> get copyWith => _$InterviewEvaluationDtoCopyWithImpl<InterviewEvaluationDto>(this as InterviewEvaluationDto, _$identity);

  /// Serializes this InterviewEvaluationDto to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is InterviewEvaluationDto&&(identical(other.id, id) || other.id == id)&&(identical(other.jobApplicationId, jobApplicationId) || other.jobApplicationId == jobApplicationId)&&(identical(other.evaluatorEmployeeId, evaluatorEmployeeId) || other.evaluatorEmployeeId == evaluatorEmployeeId)&&(identical(other.title, title) || other.title == title)&&(identical(other.score, score) || other.score == score)&&(identical(other.strengths, strengths) || other.strengths == strengths)&&(identical(other.concerns, concerns) || other.concerns == concerns)&&(identical(other.recommendation, recommendation) || other.recommendation == recommendation)&&(identical(other.comments, comments) || other.comments == comments)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.evaluator, evaluator) || other.evaluator == evaluator));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,jobApplicationId,evaluatorEmployeeId,title,score,strengths,concerns,recommendation,comments,createdAt,updatedAt,evaluator);

@override
String toString() {
  return 'InterviewEvaluationDto(id: $id, jobApplicationId: $jobApplicationId, evaluatorEmployeeId: $evaluatorEmployeeId, title: $title, score: $score, strengths: $strengths, concerns: $concerns, recommendation: $recommendation, comments: $comments, createdAt: $createdAt, updatedAt: $updatedAt, evaluator: $evaluator)';
}


}

/// @nodoc
abstract mixin class $InterviewEvaluationDtoCopyWith<$Res>  {
  factory $InterviewEvaluationDtoCopyWith(InterviewEvaluationDto value, $Res Function(InterviewEvaluationDto) _then) = _$InterviewEvaluationDtoCopyWithImpl;
@useResult
$Res call({
 String id, String? jobApplicationId, String? evaluatorEmployeeId, String? title, int? score, String? strengths, String? concerns, String? recommendation, String? comments, DateTime? createdAt, DateTime? updatedAt, EmployeeDto? evaluator
});


$EmployeeDtoCopyWith<$Res>? get evaluator;

}
/// @nodoc
class _$InterviewEvaluationDtoCopyWithImpl<$Res>
    implements $InterviewEvaluationDtoCopyWith<$Res> {
  _$InterviewEvaluationDtoCopyWithImpl(this._self, this._then);

  final InterviewEvaluationDto _self;
  final $Res Function(InterviewEvaluationDto) _then;

/// Create a copy of InterviewEvaluationDto
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? jobApplicationId = freezed,Object? evaluatorEmployeeId = freezed,Object? title = freezed,Object? score = freezed,Object? strengths = freezed,Object? concerns = freezed,Object? recommendation = freezed,Object? comments = freezed,Object? createdAt = freezed,Object? updatedAt = freezed,Object? evaluator = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,jobApplicationId: freezed == jobApplicationId ? _self.jobApplicationId : jobApplicationId // ignore: cast_nullable_to_non_nullable
as String?,evaluatorEmployeeId: freezed == evaluatorEmployeeId ? _self.evaluatorEmployeeId : evaluatorEmployeeId // ignore: cast_nullable_to_non_nullable
as String?,title: freezed == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String?,score: freezed == score ? _self.score : score // ignore: cast_nullable_to_non_nullable
as int?,strengths: freezed == strengths ? _self.strengths : strengths // ignore: cast_nullable_to_non_nullable
as String?,concerns: freezed == concerns ? _self.concerns : concerns // ignore: cast_nullable_to_non_nullable
as String?,recommendation: freezed == recommendation ? _self.recommendation : recommendation // ignore: cast_nullable_to_non_nullable
as String?,comments: freezed == comments ? _self.comments : comments // ignore: cast_nullable_to_non_nullable
as String?,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,evaluator: freezed == evaluator ? _self.evaluator : evaluator // ignore: cast_nullable_to_non_nullable
as EmployeeDto?,
  ));
}
/// Create a copy of InterviewEvaluationDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$EmployeeDtoCopyWith<$Res>? get evaluator {
    if (_self.evaluator == null) {
    return null;
  }

  return $EmployeeDtoCopyWith<$Res>(_self.evaluator!, (value) {
    return _then(_self.copyWith(evaluator: value));
  });
}
}


/// Adds pattern-matching-related methods to [InterviewEvaluationDto].
extension InterviewEvaluationDtoPatterns on InterviewEvaluationDto {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _InterviewEvaluationDto value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _InterviewEvaluationDto() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _InterviewEvaluationDto value)  $default,){
final _that = this;
switch (_that) {
case _InterviewEvaluationDto():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _InterviewEvaluationDto value)?  $default,){
final _that = this;
switch (_that) {
case _InterviewEvaluationDto() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String? jobApplicationId,  String? evaluatorEmployeeId,  String? title,  int? score,  String? strengths,  String? concerns,  String? recommendation,  String? comments,  DateTime? createdAt,  DateTime? updatedAt,  EmployeeDto? evaluator)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _InterviewEvaluationDto() when $default != null:
return $default(_that.id,_that.jobApplicationId,_that.evaluatorEmployeeId,_that.title,_that.score,_that.strengths,_that.concerns,_that.recommendation,_that.comments,_that.createdAt,_that.updatedAt,_that.evaluator);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String? jobApplicationId,  String? evaluatorEmployeeId,  String? title,  int? score,  String? strengths,  String? concerns,  String? recommendation,  String? comments,  DateTime? createdAt,  DateTime? updatedAt,  EmployeeDto? evaluator)  $default,) {final _that = this;
switch (_that) {
case _InterviewEvaluationDto():
return $default(_that.id,_that.jobApplicationId,_that.evaluatorEmployeeId,_that.title,_that.score,_that.strengths,_that.concerns,_that.recommendation,_that.comments,_that.createdAt,_that.updatedAt,_that.evaluator);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String? jobApplicationId,  String? evaluatorEmployeeId,  String? title,  int? score,  String? strengths,  String? concerns,  String? recommendation,  String? comments,  DateTime? createdAt,  DateTime? updatedAt,  EmployeeDto? evaluator)?  $default,) {final _that = this;
switch (_that) {
case _InterviewEvaluationDto() when $default != null:
return $default(_that.id,_that.jobApplicationId,_that.evaluatorEmployeeId,_that.title,_that.score,_that.strengths,_that.concerns,_that.recommendation,_that.comments,_that.createdAt,_that.updatedAt,_that.evaluator);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _InterviewEvaluationDto implements InterviewEvaluationDto {
  const _InterviewEvaluationDto({required this.id, this.jobApplicationId, this.evaluatorEmployeeId, this.title, this.score, this.strengths, this.concerns, this.recommendation, this.comments, this.createdAt, this.updatedAt, this.evaluator});
  factory _InterviewEvaluationDto.fromJson(Map<String, dynamic> json) => _$InterviewEvaluationDtoFromJson(json);

@override final  String id;
@override final  String? jobApplicationId;
@override final  String? evaluatorEmployeeId;
@override final  String? title;
@override final  int? score;
@override final  String? strengths;
@override final  String? concerns;
@override final  String? recommendation;
@override final  String? comments;
@override final  DateTime? createdAt;
@override final  DateTime? updatedAt;
@override final  EmployeeDto? evaluator;

/// Create a copy of InterviewEvaluationDto
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$InterviewEvaluationDtoCopyWith<_InterviewEvaluationDto> get copyWith => __$InterviewEvaluationDtoCopyWithImpl<_InterviewEvaluationDto>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$InterviewEvaluationDtoToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _InterviewEvaluationDto&&(identical(other.id, id) || other.id == id)&&(identical(other.jobApplicationId, jobApplicationId) || other.jobApplicationId == jobApplicationId)&&(identical(other.evaluatorEmployeeId, evaluatorEmployeeId) || other.evaluatorEmployeeId == evaluatorEmployeeId)&&(identical(other.title, title) || other.title == title)&&(identical(other.score, score) || other.score == score)&&(identical(other.strengths, strengths) || other.strengths == strengths)&&(identical(other.concerns, concerns) || other.concerns == concerns)&&(identical(other.recommendation, recommendation) || other.recommendation == recommendation)&&(identical(other.comments, comments) || other.comments == comments)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.evaluator, evaluator) || other.evaluator == evaluator));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,jobApplicationId,evaluatorEmployeeId,title,score,strengths,concerns,recommendation,comments,createdAt,updatedAt,evaluator);

@override
String toString() {
  return 'InterviewEvaluationDto(id: $id, jobApplicationId: $jobApplicationId, evaluatorEmployeeId: $evaluatorEmployeeId, title: $title, score: $score, strengths: $strengths, concerns: $concerns, recommendation: $recommendation, comments: $comments, createdAt: $createdAt, updatedAt: $updatedAt, evaluator: $evaluator)';
}


}

/// @nodoc
abstract mixin class _$InterviewEvaluationDtoCopyWith<$Res> implements $InterviewEvaluationDtoCopyWith<$Res> {
  factory _$InterviewEvaluationDtoCopyWith(_InterviewEvaluationDto value, $Res Function(_InterviewEvaluationDto) _then) = __$InterviewEvaluationDtoCopyWithImpl;
@override @useResult
$Res call({
 String id, String? jobApplicationId, String? evaluatorEmployeeId, String? title, int? score, String? strengths, String? concerns, String? recommendation, String? comments, DateTime? createdAt, DateTime? updatedAt, EmployeeDto? evaluator
});


@override $EmployeeDtoCopyWith<$Res>? get evaluator;

}
/// @nodoc
class __$InterviewEvaluationDtoCopyWithImpl<$Res>
    implements _$InterviewEvaluationDtoCopyWith<$Res> {
  __$InterviewEvaluationDtoCopyWithImpl(this._self, this._then);

  final _InterviewEvaluationDto _self;
  final $Res Function(_InterviewEvaluationDto) _then;

/// Create a copy of InterviewEvaluationDto
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? jobApplicationId = freezed,Object? evaluatorEmployeeId = freezed,Object? title = freezed,Object? score = freezed,Object? strengths = freezed,Object? concerns = freezed,Object? recommendation = freezed,Object? comments = freezed,Object? createdAt = freezed,Object? updatedAt = freezed,Object? evaluator = freezed,}) {
  return _then(_InterviewEvaluationDto(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,jobApplicationId: freezed == jobApplicationId ? _self.jobApplicationId : jobApplicationId // ignore: cast_nullable_to_non_nullable
as String?,evaluatorEmployeeId: freezed == evaluatorEmployeeId ? _self.evaluatorEmployeeId : evaluatorEmployeeId // ignore: cast_nullable_to_non_nullable
as String?,title: freezed == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String?,score: freezed == score ? _self.score : score // ignore: cast_nullable_to_non_nullable
as int?,strengths: freezed == strengths ? _self.strengths : strengths // ignore: cast_nullable_to_non_nullable
as String?,concerns: freezed == concerns ? _self.concerns : concerns // ignore: cast_nullable_to_non_nullable
as String?,recommendation: freezed == recommendation ? _self.recommendation : recommendation // ignore: cast_nullable_to_non_nullable
as String?,comments: freezed == comments ? _self.comments : comments // ignore: cast_nullable_to_non_nullable
as String?,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,evaluator: freezed == evaluator ? _self.evaluator : evaluator // ignore: cast_nullable_to_non_nullable
as EmployeeDto?,
  ));
}

/// Create a copy of InterviewEvaluationDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$EmployeeDtoCopyWith<$Res>? get evaluator {
    if (_self.evaluator == null) {
    return null;
  }

  return $EmployeeDtoCopyWith<$Res>(_self.evaluator!, (value) {
    return _then(_self.copyWith(evaluator: value));
  });
}
}

// dart format on
